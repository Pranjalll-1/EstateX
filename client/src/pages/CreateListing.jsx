import React, { useState } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { addDoc, serverTimestamp, collection } from "firebase/firestore";
import { db } from "../firebase.js";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const CreateListing = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: "",
    description: "",
    offer: true,
    regularPrice: 0,
    discountedPrice: 0,
    latitude: 0,
    longitude: 0,
    images: {},
  });
  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    description,
    offer,
    regularPrice,
    discountedPrice,
    latitude,
    longitude,
    images,
  } = formData;

  const onChange = (e) => {
    let boolean = null;
    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        images: e.target.files,
      }));
    }
    if (!e.target.files) {
      setFormData((prev) => ({
        ...prev,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  };

  async function reverseGeocodeOSM(lat, lon) {
    // Using BigDataCloud instead of Nominatim to avoid CORS/403 errors
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Reverse geocode request failed: ${res.status}`);
    }
    return res.json();
  }

  const handleConvertCoords = async () => {
    const la = parseFloat(latitude);
    const lo = parseFloat(longitude);
    if (
      Number.isNaN(la) ||
      Number.isNaN(lo) ||
      la < -90 ||
      la > 90 ||
      lo < -180 ||
      lo > 180
    ) {
      toast.error("Please enter valid latitude and longitude values");
      return;
    }
    setLoading(true);
    try {
      const result = await reverseGeocodeOSM(la, lo);

      // Construct a readable address from BigDataCloud's response
      // It returns fields like locality, city, principalSubdivision, countryName
      const display = [
        result.locality,
        result.city,
        result.principalSubdivision,
        result.countryName,
      ]
        .filter(Boolean)
        .join(", "); // filter(Boolean) removes empty values

      setFormData((prev) => ({
        ...prev,
        address: display || "Address not found", // Fallback if empty
        latitude: la,
        longitude: lo,
      }));
      toast.success("Address populated from coordinates");
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch address for these coordinates");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (offer && +discountedPrice >= +regularPrice) {
      setLoading(false);
      toast.error("Discounted price needs to be less than regular price");
      return;
    }
    if (images.length > 6) {
      setLoading(false);
      toast.error("A max of 6 images are allowed");
      return;
    }

    let geolocation = {};
    let location = address;

    geolocation = {
      lat: parseFloat(latitude),
      lng: parseFloat(longitude),
    };

    async function storeImage(image) {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

      const data = new FormData();
      data.append("file", image);
      data.append("upload_preset", uploadPreset);

      const res = await fetch(url, { method: "POST", body: data });
      if (!res.ok) throw new Error("Cloudinary upload failed");
      const json = await res.json();
      return json.secure_url;
    }

    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image)),
    ).catch((error) => {
      setLoading(false);
      toast.error("Image upload failed");
      return;
    });

    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
      userRef: auth.currentUser.uid,
    };
    delete formDataCopy.images;
    if (!formDataCopy.offer) delete formDataCopy.discountedPrice;
    delete formDataCopy.latitude;
    delete formDataCopy.longitude;
    const docRef = await addDoc(collection(db, "listings"), formDataCopy);
    setLoading(false);
    toast.success("Listing created successfully");
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  if (loading) {
    return <Spinner />;
  }
  return (
    <main className="max-w-md mx-auto px-2 mb-6">
      <h1 className="text-3xl text-center font-bold mt-6">Create a Listing</h1>
      <form onSubmit={onSubmit}>
        <p className="text-lg mt-6 font-semibold">Sell/Rent</p>
        <div className="flex gap-4">
          <button
            type="button"
            id="type"
            value="sale"
            onClick={onChange}
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out cursor-pointer w-full ${type === "sale"
                ? "bg-slate-600 text-white"
                : "bg-white text-black"
              }`}
          >
            Sell
          </button>
          <button
            type="button"
            id="type"
            value="rent"
            onClick={onChange}
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out cursor-pointer w-full ${type === "rent"
                ? "bg-slate-600 text-white"
                : "bg-white text-black"
              }`}
          >
            Rent
          </button>
        </div>
        <p className="text-lg mt-6 font-semibold">Name</p>
        <input
          type="text"
          id="name"
          value={name}
          onChange={onChange}
          placeholder="Name"
          maxLength={32}
          minLength={10}
          required
          className="w-full mb-6 px-4 py-2 text-xl text-gray-700 bg-white border-2 border-gray-300 rounded transition ease-in-out"
        />
        <div className="flex w-full space-x-6 mb-6">
          <div>
            <p className="text-lg font-semibold ">Beds</p>
            <input
              type="number"
              value={bedrooms}
              id="bedrooms"
              onChange={onChange}
              min={"1"}
              max={"50"}
              required
              className="w-full mb-6 px-6 py-2 text-xl text-center text-gray-700 bg-white border-2 border-gray-300 rounded transition ease-in-out"
            />
          </div>
          <div>
            <p className="text-lg font-semibold ">Baths</p>
            <input
              type="number"
              value={bathrooms}
              id="bathrooms"
              onChange={onChange}
              min={"1"}
              max={"50"}
              required
              className="w-full mb-6 px-6 py-2 text-xl text-center text-gray-700 bg-white border-2 border-gray-300 rounded transition ease-in-out"
            />
          </div>
        </div>
        <p className="text-lg mt-6 font-semibold">Parking spot</p>
        <div className="flex gap-4">
          <button
            type="button"
            id="parking"
            value={true}
            onClick={onChange}
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out cursor-pointer w-full ${parking ? "bg-slate-600 text-white" : "bg-white text-black"
              }`}
          >
            Yes
          </button>
          <button
            type="button"
            id="parking"
            value={false}
            onClick={onChange}
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out cursor-pointer w-full ${!parking ? "bg-slate-600 text-white" : "bg-white text-black"
              }`}
          >
            No
          </button>
        </div>
        <p className="text-lg mt-6 font-semibold">Furnished</p>
        <div className="flex gap-4">
          <button
            type="button"
            id="furnished"
            value={true}
            onClick={onChange}
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out cursor-pointer w-full ${furnished ? "bg-slate-600 text-white" : "bg-white text-black"
              }`}
          >
            Yes
          </button>
          <button
            type="button"
            id="furnished"
            value={false}
            onClick={onChange}
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out cursor-pointer w-full ${!furnished ? "bg-slate-600 text-white" : "bg-white text-black"
              }`}
          >
            No
          </button>
        </div>
        <p className="text-lg mt-6 font-semibold">Address</p>
        <textarea
          type="text"
          id="address"
          value={address}
          onChange={onChange}
          placeholder="Address"
          required
          className="w-full mb-6 px-4 py-2 text-xl text-gray-700 bg-white border-2 border-gray-300 rounded transition ease-in-out"
        />

        {geolocationEnabled && (
          <>
            <div className="flex space-x-6">
              <div className="div">
                <p>Latitude</p>
                <input
                  type="number"
                  step={"any"}
                  id="latitude"
                  value={latitude}
                  onChange={onChange}
                  min={"-90"}
                  max={"90"}
                  required
                  className="w-full mb-6 px-4 py-2 text-xl text-gray-700 bg-white border-2 border-gray-300 rounded transition ease-in-out"
                />
              </div>

              <div className="div">
                <div className="div">
                  <p>Longitude</p>
                  <input
                    type="number"
                    id="longitude"
                    step={"any"}
                    value={longitude}
                    onChange={onChange}
                    min={"-180"}
                    max={"180"}
                    required
                    className="w-full mb-6 px-4 py-2 text-xl text-gray-700 bg-white border-2 border-gray-300 rounded transition ease-in-out"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <button
                type="button"
                onClick={handleConvertCoords}
                disabled={loading}
                className="w-full bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition duration-150 cursor-pointer"
              >
                {loading ? "Converting..." : "Convert coords to address"}
              </button>
            </div>
          </>
        )}
        <p className="text-lg  font-semibold">Description</p>
        <textarea
          type="text"
          id="description"
          value={description}
          onChange={onChange}
          placeholder="Description"
          required
          className="w-full mb-6 px-4 py-2 text-xl text-gray-700 bg-white border-2 border-gray-300 rounded transition ease-in-out"
        />
        <p className="text-lg font-semibold">Offer</p>
        <div className="flex gap-4">
          <button
            type="button"
            id="offer"
            value={true}
            onClick={onChange}
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out cursor-pointer w-full ${offer ? "bg-slate-600 text-white" : "bg-white text-black"
              }`}
          >
            Yes
          </button>
          <button
            type="button"
            id="offer"
            value={false}
            onClick={onChange}
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out cursor-pointer w-full ${!offer ? "bg-slate-600 text-white" : "bg-white text-black"
              }`}
          >
            No
          </button>
        </div>
        <div>
          <div className="mb-6">
            <p className="text-lg font-semibold mt-6">Regular price</p>
            <div className="flex justify-between gap-6">
              <input
                type="number"
                id="regularPrice"
                value={regularPrice}
                onChange={onChange}
                min={50}
                max={4000000}
                required
                className="w-1/2 mb-6 px-4 py-2 text-xl text-gray-700 bg-white border-2 border-gray-300 rounded transition ease-in-out"
              />
              {type === "rent" && <p className="w-1/2 text-md ">&#8377; per month</p>}
            </div>
          </div>
          <div>
            {offer && (
              <div className="mb-6">
                <p className="text-lg font-semibold mt-6">Discounted price</p>
                <div className="flex justify-between gap-6">
                  <input
                    type="number"
                    id="discountedPrice"
                    value={discountedPrice}
                    onChange={onChange}
                    min={50}
                    max={4000000}
                    required={offer}
                    className="w-1/2 mb-6 px-4 py-2 text-xl text-gray-700 bg-white border-2 border-gray-300 rounded transition ease-in-out"
                  />
                  {type === "rent" && (
                    <p className="w-1/2 text-md ">&#8377; per month</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mb-6">
          <p className="text-lg font-semibold">Images</p>
          <p className="text-gray-600 mt-2 mb-2">
            The first image will be the cover (max 6)
          </p>
          <input
            type="file"
            id="images"
            onChange={onChange}
            accept=".jpg, .png, .jpeg"
            multiple
            required
            className="w-full px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out duration-150"
          />
        </div>
        <button
          type="submit"
          className="cursor-pointer mb-6 w-full bg-blue-600 px-7 py-3 text-white font-semibold text-sm uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg transition duration-150 ease-in-out"
        >
          Create a Listing
        </button>
      </form>
    </main>
  );
};

export default CreateListing;
