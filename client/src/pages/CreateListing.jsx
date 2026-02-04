import React, { useState } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";

const CreateListing = () => {
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

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (discountedPrice >= regularPrice) {
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
    let location;
    if (geolocationEnabled) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${import.meta.env.REACT_APP_GEOCODE_API_KEY}`,
      );
      const data = await response.json();
      console.log(data);
    }
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
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out cursor-pointer w-full ${
              type === "rent"
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
          >
            Sell
          </button>
          <button
            type="button"
            id="type"
            value="rent"
            onClick={onChange}
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out cursor-pointer w-full ${
              type === "sale"
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
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
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out cursor-pointer w-full ${
              !parking ? "bg-white text-black" : "bg-slate-600 text-white"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            id="parking"
            value={false}
            onClick={onChange}
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out cursor-pointer w-full ${
              parking ? "bg-white text-black" : "bg-slate-600 text-white"
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
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out cursor-pointer w-full ${
              !furnished ? "bg-white text-black" : "bg-slate-600 text-white"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            id="furnished"
            value={false}
            onClick={onChange}
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out cursor-pointer w-full ${
              furnished ? "bg-white text-black" : "bg-slate-600 text-white"
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

        {!geolocationEnabled && (
          <div className="flex space-x-6">
            <div className="div">
              <p>Latitude</p>
              <input
                type="number"
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
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out cursor-pointer w-full ${
              !offer ? "bg-white text-black" : "bg-slate-600 text-white"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            id="offer"
            value={false}
            onClick={onChange}
            className={`px-7 py-3 font-medium uppercase text-sm shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-200 ease-in-out cursor-pointer w-full ${
              offer ? "bg-white text-black" : "bg-slate-600 text-white"
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
              {type === "rent" && <p className="w-1/2 text-md ">$ per month</p>}
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
                    <p className="w-1/2 text-md ">$ per month</p>
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
