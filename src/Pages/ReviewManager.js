import React, { useState, useEffect } from "react";

// Review Manager Component
const ReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    text: "",
    reviewerName: "",
    rating: 1,
  });
  const [image, setImage] = useState(null); // State to handle image file
  const [editReview, setEditReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch reviews from the backend
  const fetchReviews = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reviews`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setReviews(data);
      } else {
        throw new Error(data.message || "Failed to fetch reviews");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch reviews");
    }
  };

  // Handle review creation
  const createReview = async () => {
    if (!newReview.text || !newReview.reviewerName || !image) {
      setError("Text, reviewer name, and image are required");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("text", newReview.text);
      formData.append("reviewerName", newReview.reviewerName);
      formData.append("rating", newReview.rating);
      formData.append("image", image); // Append image file to FormData

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reviews/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData, // Send FormData
      });

      const response = await res.json();

      if (res.ok) {
        fetchReviews();
        setNewReview({
          text: "",
          reviewerName: "",
          rating: 1,
        });
        setImage(null); // Reset image
        setError("");
      } else {
        throw new Error(response.message || "Failed to create review");
      }
    } catch (err) {
      console.error(err);
      setError("Error creating review: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle review updates
  const updateReview = async (id) => {
    if (!editReview.text || !editReview.reviewerName) {
      setError("Text and reviewer name are required for update");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("text", editReview.text);
      formData.append("reviewerName", editReview.reviewerName);
      formData.append("rating", editReview.rating);
      if (image) formData.append("image", image); // Append image if updating

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reviews/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const response = await res.json();

      if (res.ok) {
        fetchReviews();
        setIsEditing(false);
        setEditReview(null);
        setImage(null); // Reset image
        setError("");
      } else {
        throw new Error(response.message || "Failed to update review");
      }
    } catch (err) {
      console.error(err);
      setError("Error updating review: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle review deletion
  const deleteReview = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reviews${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        fetchReviews();
      } else {
        throw new Error("Failed to delete review");
      }
    } catch (err) {
      console.error(err);
      setError("Error deleting review: " + err.message);
    }
  };

  // Set the review to edit mode
  const handleEdit = (review) => {
    setIsEditing(true);
    setEditReview(review);
  };

  // Initial review load
  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Review Management</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Create or Edit Form */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-semibold mb-4">
          {isEditing ? "Edit Review" : "Create New Review"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Reviewer Name"
            className="p-3 border border-gray-300 rounded-lg w-full"
            value={isEditing ? editReview?.reviewerName : newReview.reviewerName}
            onChange={(e) =>
              isEditing
                ? setEditReview({ ...editReview, reviewerName: e.target.value })
                : setNewReview({ ...newReview, reviewerName: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Review Text"
            className="p-3 border border-gray-300 rounded-lg w-full"
            value={isEditing ? editReview?.text : newReview.text}
            onChange={(e) =>
              isEditing
                ? setEditReview({ ...editReview, text: e.target.value })
                : setNewReview({ ...newReview, text: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Rating (1-5)"
            min="1"
            max="5"
            className="p-3 border border-gray-300 rounded-lg w-full"
            value={isEditing ? editReview?.rating : newReview.rating}
            onChange={(e) =>
              isEditing
                ? setEditReview({ ...editReview, rating: e.target.value })
                : setNewReview({ ...newReview, rating: e.target.value })
            }
          />
          {/* File input for Image Upload */}
          <input
            type="file"
            className="p-3 border border-gray-300 rounded-lg w-full"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])} // Update image state
          />
        </div>
        <button
          onClick={isEditing ? () => updateReview(editReview._id) : createReview}
          className={`mt-6 w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg 
            transition-all duration-300 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={loading}
        >
          {loading ? "Processing..." : isEditing ? "Update Review" : "Create Review"}
        </button>
      </div>

      {/* Review List - Display in Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white shadow-lg rounded-lg p-6 flex flex-col">
            <img
              src={review.image || "https://via.placeholder.com/150"}
              alt={review.reviewerName}
              className="rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold mb-2">{review.reviewerName}</h3>
            <p className="text-gray-700 mb-2">{review.text}</p>
            <p className="text-gray-600 mb-4">Rating: {review.rating}</p>
            <div className="flex justify-between mt-auto">
              <button
                onClick={() => handleEdit(review)}
                className="bg-yellow-400 text-white px-4 py-2 rounded-lg"
              >
                Edit
              </button>
              <button
                onClick={() => deleteReview(review._id)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewManager;
