import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import Slider from "../components/Slider";
import { useState, useEffect } from "react";
import { db } from "../firebase.js";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem.jsx";
import { Link } from "react-router";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [offerListings, setOfferListings] = useState(null);
  const [rentListings, setRentListings] = useState(null);
  const [saleListings, setSaleListings] = useState(null);

  useEffect(() => {
    async function fetchOfferListings() {
      try {
        const listingRef = collection(db, "listings");
        const q = query(
          listingRef,
          where("offer", "==", true),
          orderBy("timestamp", "desc"),
          limit(4),
        );
        const querySnap = await getDocs(q);
        let listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setOfferListings(listings);
        setLoading(false);
        console.log(listings);
      } catch (error) {
        console.error("Error fetching offer listings: ", error);
      }
    }
    fetchOfferListings();
  }, []);

  useEffect(() => {
    async function fetchRentListngs() {
      try {
        const listingRef = collection(db, "listings");
        const q = query(
          listingRef,
          where("type", "==", "rent"),
          orderBy("timestamp", "desc"),
          limit(4),
        );
        const querySnap = await getDocs(q);
        let listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setRentListings(listings);
        setLoading(false);
        console.log(listings);
      } catch (error) {
        console.error(error);
      }
    }
    fetchRentListngs();
  }, []);

  useEffect(() => {
    async function fetchSaleListngs() {
      try {
        const listingRef = collection(db, "listings");
        const q = query(
          listingRef,
          where("type", "==", "sale"),
          orderBy("timestamp", "desc"),
          limit(4),
        );
        const querySnap = await getDocs(q);
        let listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setSaleListings(listings);
        setLoading(false);
        console.log(listings);
      } catch (error) {
        console.error(error);
      }
    }
    fetchSaleListngs();
  }, []);

  if (loading) return <Spinner />;
  return (
    <div>
      <Slider />
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {offerListings && offerListings.length > 0 && (
          <div className="m-2 mb-6 ">
            <h2 className="px-3 text-2xl mt-6 font-semibold">Recent Offers</h2>
            {offerListings.length < 4 && (
              <Link to={"/offers"}>
                <p className="px-3 text-sm text-blue-600 hover:text-blue-900 transition duration-150 ease-in-out">
                  View all offers
                </p>
              </Link>
            )}
            <ul className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {offerListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                />
              ))}
            </ul>
          </div>
        )}
        {rentListings && rentListings.length > 0 && (
          <div className="m-2 mb-6 ">
            <h2 className="px-3 text-2xl mt-6 font-semibold">Recent Rentals</h2>
            {offerListings.length < 4 && (
              <Link to={"/category/rent"}>
                <p className="px-3 text-sm text-blue-600 hover:text-blue-900 transition duration-150 ease-in-out">
                  View all rentals
                </p>
              </Link>
            )}
            <ul className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rentListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                />
              ))}
            </ul>
          </div>
        )}
        {saleListings && saleListings.length > 0 && (
          <div className="m-2 mb-6 ">
            <h2 className="px-3 text-2xl mt-6 font-semibold">Recent Sales</h2>
            {saleListings.length < 4 && (
              <Link to={"/category/sale"}>
                <p className="px-3 text-sm text-blue-600 hover:text-blue-900 transition duration-150 ease-in-out">
                  View all sales
                </p>
              </Link>
            )}
            <ul className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {saleListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
