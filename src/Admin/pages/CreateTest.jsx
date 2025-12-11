import React, { useState } from "react";
import Sidebarcomp from "../sidenav";
import axios from "axios";
function CreateTest() {
    const [formData, setFormData] = useState({
    test_name: "",
    description: "",
    duration: "",
    date: "",
    start_time: "",
    end_time: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/tests`, formData);
      alert("✅ Test created successfully!");
      setFormData({ test_name: "", description: "", duration: "", date: "", start_time: "", end_time: "" });
    } catch (error) {
      console.error(error);
      alert("❌ Error creating test");
    }
  };
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Sidebarcomp />

      {/* Page Content */}
      
      <div className="flex-1 flex items-center justify-center p-6 mt-5">
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-2xl"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Create New Test
      </h2>

      {/* Test Name */}
      <div className="mb-4">
        <label className="block text-gray-600 font-medium mb-1">Test Name</label>
        <input
          type="text"
          name="test_name"
          value={formData.test_name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-gray-600 font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* Duration */}
      <div className="mb-4">
        <label className="block text-gray-600 font-medium mb-1">Duration (Minutes)</label>
        <input
          type="number"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* Date + Start Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-600 font-medium mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-medium mb-1">Start Time</label>
          <input
            type="time"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* End Time */}
      <div className="mb-4">
        <label className="block text-gray-600 font-medium mb-1">End Time</label>
        <input
          type="time"
          name="end_time"
          value={formData.end_time}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition duration-300"
      >
        Create Test
      </button>
    </form>
  </div>
</div>
    
  );
}

export default CreateTest;
