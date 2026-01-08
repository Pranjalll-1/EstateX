import React, { useState } from "react";

const Profile = () => {
  const [formData, setFormData] = useState({
    name: "Pranjal",
    email: "ps350575@gmail.com",
  });
  const { name, email } = formData;
  return (
    <>
      <section className="max-w-6xl mx-auto flex justify-center items-center flex-col">
        <h1 className="text-3xl text-center font-bold mt-6 ">My Profile</h1>
        <div className="w-full md:w-[50%] mt-6 px-3">
          <form>
            <input
              type="text"
              id="name"
              value={name}
              disabled
              className="w-full mb-6 px-16 py-4 text-xl text-gray-700 bg-white border-2 border-gray-300 rounded transition ease-in-out "
            />
            <input
              type="email"
              id="email"
              value={email}
              disabled
              className="w-full mb-6 px-16 py-4 text-xl text-gray-700 bg-white border-2 border-gray-300 rounded transition ease-in-out "
            />
          </form>
        </div>
      </section>
    </>
  );
};

export default Profile;
