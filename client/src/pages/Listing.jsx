import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import Spinner from "../components/Spinner.jsx";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import {
  FaShare,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaParking,
  FaCouch,
} from "react-icons/fa";

const Listing = () => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const params = useParams();

  useEffect(() => {
    async function getListing() {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);

      console.log("DOC EXISTS:", docSnap.exists());
      console.log("DATA:", docSnap.data());

      if (docSnap.exists()) {
        setListing(docSnap.data());
        setLoading(false);
      }
    }
    getListing();
  }, [params.listingId]);

  if (loading) {
    return <Spinner />;
  }
  return (
    <main>
      <Swiper
        className=""
        slidesPerView={1}
        navigation
        pagination={{ type: "progressbar" }}
        effect="fade"
        modules={[EffectFade, Autoplay, Navigation, Pagination]}
        autoplay={{ delay: 3000 }}
      >
        {listing.imgUrls?.map((url, index) => (
          <SwiperSlide key={index}>
            <div
              className="relative w-full overflow-hidden h-[300px]"
              style={{
                backgroundImage: `url(${url})`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
              }}
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        className="fixed top-[8%] right-[3%] z-100 bg-white border-2 border-gray-400 cursor-pointer rounded-full w-12 h-12 flex justify-center items-center"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);
          setTimeout(() => {
            setShareLinkCopied(false);
          }, 2000);
        }}
      >
        <FaShare className="text-lg text-slate-500" />
      </div>
      {shareLinkCopied && (
        <div className="fixed top-[15%] right-[4%] p-0.5 z-100 border-2 border-gray-400 bg-white text-black rounded-md transition duration-150 ease-in-out">
          <p className="font-semibold">Link Copied</p>
        </div>
      )}
      <div className="flex flex-col md:flex-row max-w-6xl lg:mx-auto m-4 p-4 rounded-lg shadow-lg bg-white lg:space-x-5">
        {/* info */}
        <div className="w-full h-[200px] lg:h-[400px]">
          <p className="text-2xl font-bold mb-3 text-blue-900 ">
            {listing.name} -
            {listing.offer
              ? ` ₹${Number(listing.discountedPrice).toLocaleString("en-IN")}`
              : ` ₹${Number(listing.regularPrice).toLocaleString("en-IN")}`}
            {listing.type === "rent" && " / month"}
          </p>
          <p className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-red-500" />
            {listing.address}
          </p>
          <div className="flex justify-start items-center gap-4 mt-3 w-[75%]">
            <p className="bg-red-800 w-full max-w-[200px] shadow-md text-center text-white rounded-md p-1 font-semibold">
              {listing.type === "rent" ? "Rent" : "Sale"}
            </p>
            {listing.offer && (
              <p className="bg-green-800 w-full max-w-[200px] shadow-md text-center text-white rounded-md p-1 font-semibold">
                ₹{+listing.regularPrice - +listing.discountedPrice} discount
              </p>
            )}
          </div>
          <p className="mt-3">
            <b>Descripiton - </b>
            <span className="text-gray-700">{listing.description}</span>
          </p>
          <div className="mt-3 flex justify-start items-center gap-4 w-full">
            <div className="flex items-center gap-2">
              <FaBed className="" />
              <p className="text-sm">
                {listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : "1 Bed"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <FaBath className="" />
              <p className="text-sm">
                {listing.bathrooms > 1
                  ? `${listing.bathrooms} Baths`
                  : "1 Bath"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!listing.parking && (
                <>
                  <FaParking className="" />
                  <p className="text-sm">Parking Available</p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {listing.furnished && (
                <>
                  <FaCouch className="" />
                  <p className="text-sm">Fully Furnished</p>
                </>
              )}
            </div>
          </div>
        </div>
        {/* map */}
        <div className="bg-blue-300 w-full h-[200px] lg:h-[400px] z-10 overflow-x-hidden"></div>
      </div>
    </main>
  );
};

export default Listing;
