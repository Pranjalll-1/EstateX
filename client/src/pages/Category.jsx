import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { db } from "../firebase.js";
import Spinner from "../components/Spinner.jsx";
import ListingItem from "../components/ListingItem.jsx";
import { useParams } from "react-router";

const Category = () => {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState(null);
  const params = useParams();

  useEffect(() => {
    async function fetchListings() {
      try {
        const docRef = collection(db, "listings");
        const q = query(
          docRef,
          where("type", "==", params.categoryName),
          orderBy("timestamp", "desc"),
          limit(8),
        );
        const docSnap = await getDocs(q);
        const lastVisible = docSnap.docs[docSnap.docs.length - 1];
        setLastFetchedListing(lastVisible);
        const listings = [];
        docSnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setListings(listings);
        setLoading(false);
      } catch (error) {
        toast.error("Could not fetch listings");
      }
    }
    fetchListings();
  }, [params.categoryName]);

  async function onFetchMoreListings() {
    try {
      const docRef = collection(db, "listings");
      const q = query(
        docRef,
        where("type", "==", params.categoryName),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchedListing),
        limit(4),
      );
      const docSnap = await getDocs(q);
      const lastVisible = docSnap.docs[docSnap.docs.length - 1];
      setLastFetchedListing(lastVisible);
      const listings = [];
      docSnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setListings((prev) => [...prev, ...listings]);
      setLoading(false);
    } catch (error) {
      toast.error("Could not fetch listings");
    }
  }

  if (loading) return <Spinner />;
  return (
    <div className="max-w-6xl mx-auto px-3">
      <h1 className="text-3xl text-center mt-6 font-bold">
        {params.categoryName === "rent" ? "Places for rent" : "Places for sale"}
      </h1>
      {listings && listings.length > 0 ? (
        <>
          <main className="mt-6">
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </main>
          {lastFetchedListing && (
            <div className="flex justify-center items-center mt-6">
              <button
                onClick={onFetchMoreListings}
                className="cursor-pointer bg-white text-black px-3 py-1.5 border border-1 hover:bg-gray-300 trasnition duration-150 ease-in-out"
              >
                Load more
              </button>
            </div>
          )}
        </>
      ) : (
        <p>There are no current listings</p>
      )}
    </div>
  );
};

export default Category;
