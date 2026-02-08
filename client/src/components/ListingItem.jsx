import React from "react";
import { Link } from "react-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FaTrash } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
dayjs.extend(relativeTime);

const ListingItem = ({ listing, id, onEdit, onDelete }) => {
  return (
    <li className="m-[10px] bg-white relative flex flex-col justify-between items-center shadow-md hover:shadow-lg rounded-md overflow-hidden trasnition-shadow duration-150">
      <Link to={`/category/${listing.type}/${id}`} className="contents">
        <img
          src={listing.imgUrls[0]}
          alt="Listing image"
          className="h-[170px] w-full object-cover hover:scale-105 transition-scale duration-200 ease-in-out"
          loading="lazy"
        />
        <p className="absolute top-2 left-2 bg-[#3377cc] text-white uppercase text-xs font-semibold p-2 rounded-md shadow-lg">
          {dayjs(listing.timestamp?.toDate()).fromNow()}
        </p>
        <div className="w-full p-[10px]">
          <p className="font-semibold m-0 text-xl truncate">{listing.name}</p>
          <p className="text-[#457b9d] mt-2 font-semibold">
            {listing.offer
              ? `₹${Number(listing.discountedPrice).toLocaleString("en-IN")}`
              : `₹${Number(listing.regularPrice).toLocaleString("en-IN")}`}
            {listing.type === "rent" && " / month"}
          </p>
          <div className="flex items-center mt-2 space-x-3">
            <div className="flex items-center space-x-1">
              <p className="font-bold text-xs ">
                {listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : "1 Bed"}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <p className="font-bold text-xs">
                {listing.baths > 1 ? `${listing.baths} Baths` : "1 Bath"}
              </p>
            </div>
          </div>
        </div>
      </Link>
      {onDelete && (
        <FaTrash
          className="absolute bottom-2 right-2 h-[14px] cursor-pointer text-red-500 hover:scale-120 transition-scale duration-150 ease-in-out"
          onClick={() => onDelete(listing.id)}
        />
      )}
      {onEdit && (
        <MdEdit
          className="absolute bottom-2 right-8 h-4 cursor-pointer hover:scale-120 transition-scale duration-150 ease-in-out"
          onClick={() => onEdit(listing.id)}
        />
      )}
    </li>
  );
};

export default ListingItem;
