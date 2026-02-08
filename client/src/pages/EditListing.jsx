import React, { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useParams } from "react-router-dom";

const EditListing = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [geolocationEnabled] = useState(true);
  const [listing, setListing] = useState(null);

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
    images: [],
    imgUrls: [],
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

  useEffect(() => {
    setLoading(true);
    async function fetchListingData() {
      const listingRef = doc(db, "listings", params.listingId);
      const listingSnap = await getDoc(listingRef);

      if (listingSnap.exists()) {
        const data = listingSnap.data();
        setListing(data);

        setFormData({
          ...data,

          latitude: data.geolocation ? data.geolocation.lat : 0,
          longitude: data.geolocation ? data.geolocation.lng : 0,

          images: [],
          imgUrls: data.imgUrls || [],
        });

        setLoading(false);
      } else {
        navigate("/");
        toast.error("Listing not found");
      }
    }
    fetchListingData();
  }, [navigate, params.listingId]);

  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser.uid) {
      toast.error("You cannot edit this listing");
      navigate("/");
    }
  }, [navigate, auth.currentUser.uid, listing]);

  const onChange = (e) => {
    let boolean = null;
    if (e.target.value === "true") boolean = true;
    if (e.target.value === "false") boolean = false;

    // Files
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        images: e.target.files,
      }));
    }
    // Text/Booleans
    if (!e.target.files) {
      setFormData((prev) => ({
        ...prev,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  };

  // Helper: Geocoding
  async function reverseGeocodeOSM(lat, lon) {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Reverse geocode request failed");
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
      const display = [
        result.locality,
        result.city,
        result.principalSubdivision,
        result.countryName,
      ]
        .filter(Boolean)
        .join(", ");

      setFormData((prev) => ({
        ...prev,
        address: display || "Address not found",
        latitude: la,
        longitude: lo,
      }));
      toast.success("Address populated");
    } catch (err) {
      toast.error("Could not fetch address");
    } finally {
      setLoading(false);
    }
  };

  async function storeImage(image) {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
      const storageRef = ref(storage, filename);
      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        },
      );
    });
  }

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

    // 2. Fix: Handle Images
    // If new images (File object) are present, upload them.
    // If not, keep the existing URLs from formData.imgUrls
    let imgUrls = formData.imgUrls;

    if (images && images.length > 0) {
      try {
        imgUrls = await Promise.all(
          [...images].map((image) => storeImage(image)),
        );
      } catch (error) {
        setLoading(false);
        toast.error("Image upload failed");
        return;
      }
    }

    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation: {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
      },
      timestamp: serverTimestamp(),
      userRef: auth.currentUser.uid,
    };

    // Cleanup object before sending to DB
    delete formDataCopy.images;
    delete formDataCopy.latitude;
    delete formDataCopy.longitude;
    if (!formDataCopy.offer) delete formDataCopy.discountedPrice;

    const docRef = doc(db, "listings", params.listingId);
    await updateDoc(docRef, formDataCopy);

    setLoading(false);
    toast.success("Listing updated successfully");
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  if (loading) return <Spinner />;

  return (
    <main className="max-w-md mx-auto px-2 mb-6">
      <h1 className="text-3xl text-center font-bold mt-6">Edit Listing</h1>
      <form onSubmit={onSubmit}>
        <p className="text-lg mt-6 font-semibold">Sell/Rent</p>
        <div className="flex gap-4">
          <button
            type="button"
            id="type"
            value="sale"
            onClick={onChange}
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded transition duration-200 ease-in-out cursor-pointer w-full ${
              type === "sale"
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
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded transition duration-200 ease-in-out cursor-pointer w-full ${
              type === "rent"
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
            <p className="text-lg font-semibold">Beds</p>
            <input
              type="number"
              id="bedrooms"
              value={bedrooms}
              onChange={onChange}
              min="1"
              max="50"
              required
              className="w-full px-6 py-2 text-xl text-center text-gray-700 bg-white border-2 border-gray-300 rounded transition ease-in-out"
            />
          </div>
          <div>
            <p className="text-lg font-semibold">Baths</p>
            <input
              type="number"
              id="bathrooms"
              value={bathrooms}
              onChange={onChange}
              min="1"
              max="50"
              required
              className="w-full px-6 py-2 text-xl text-center text-gray-700 bg-white border-2 border-gray-300 rounded transition ease-in-out"
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
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded transition duration-200 ease-in-out cursor-pointer w-full ${
              parking ? "bg-slate-600 text-white" : "bg-white text-black"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            id="parking"
            value={false}
            onClick={onChange}
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded transition duration-200 ease-in-out cursor-pointer w-full ${
              !parking ? "bg-slate-600 text-white" : "bg-white text-black"
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
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded transition duration-200 ease-in-out cursor-pointer w-full ${
              furnished ? "bg-slate-600 text-white" : "bg-white text-black"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            id="furnished"
            value={false}
            onClick={onChange}
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded transition duration-200 ease-in-out cursor-pointer w-full ${
              !furnished ? "bg-slate-600 text-white" : "bg-white text-black"
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
          <div className="flex space-x-6 mb-6">
            <div className="w-full">
              <p className="font-semibold">Latitude</p>
              <input
                type="number"
                id="latitude"
                value={latitude}
                onChange={onChange}
                min="-90"
                max="90"
                step="any"
                required
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-2 border-gray-300 rounded transition ease-in-out"
              />
            </div>
            <div className="w-full">
              <p className="font-semibold">Longitude</p>
              <input
                type="number"
                id="longitude"
                value={longitude}
                onChange={onChange}
                min="-180"
                max="180"
                step="any"
                required
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-2 border-gray-300 rounded transition ease-in-out"
              />
            </div>
          </div>
        )}

        {geolocationEnabled && (
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
        )}

        <p className="text-lg font-semibold">Description</p>
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
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            id="offer"
            value={true}
            onClick={onChange}
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded transition duration-200 ease-in-out cursor-pointer w-full ${
              offer ? "bg-slate-600 text-white" : "bg-white text-black"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            id="offer"
            value={false}
            onClick={onChange}
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded transition duration-200 ease-in-out cursor-pointer w-full ${
              !offer ? "bg-slate-600 text-white" : "bg-white text-black"
            }`}
          >
            No
          </button>
        </div>

        <div className="flex items-center mb-6">
          <div className="">
            <p className="text-lg font-semibold">Regular price</p>
            <div className="flex w-full justify-center items-center space-x-6">
              <input
                type="number"
                id="regularPrice"
                value={regularPrice}
                onChange={onChange}
                min="50"
                max="4000000"
                required
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-2 border-gray-300 rounded transition ease-in-out"
              />
              {type === "rent" && (
                <div className="">
                  <p className="text-md w-full whitespace-nowrap">$ / Month</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {offer && (
          <div className="flex items-center mb-6">
            <div className="">
              <p className="text-lg font-semibold">Discounted price</p>
              <div className="flex w-full justify-center items-center space-x-6">
                <input
                  type="number"
                  id="discountedPrice"
                  value={discountedPrice}
                  onChange={onChange}
                  min="50"
                  max="4000000"
                  required={offer}
                  className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-2 border-gray-300 rounded transition ease-in-out"
                />
                {type === "rent" && (
                  <div className="">
                    <p className="text-md w-full whitespace-nowrap">
                      $ / Month
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
            // REMOVED 'required' here to allow keeping old images
            className="w-full px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out duration-150"
          />
        </div>

        <button
          type="submit"
          className="mb-6 w-full bg-blue-600 px-7 py-3 text-white font-medium uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg transition duration-150 ease-in-out"
        >
          Edit Listing
        </button>
      </form>
    </main>
  );
};

export default EditListing;
