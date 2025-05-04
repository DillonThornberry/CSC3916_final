import React, { useState } from 'react';
import { use } from 'react';

const env = process.env;

const ReviewForm = ({ movieId }) => {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('5');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');

    try {
        console.log('Submitting post request')
        const response = await fetch(`${env.REACT_APP_API_URL}/reviews`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
            },
            body: JSON.stringify({
            movieId,
            review: reviewText,
            rating: parseInt(rating, 10),
            username: localStorage.getItem('username'),
            }),
        });
        console.log('Response:', response);
        if (!response.ok) throw new Error('Failed to submit review');

        setStatus('Review submitted!');
        setReviewText('');
        setRating('5');
        } catch (err) {
        setStatus(`Error: ${err.message}`);
        }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        placeholder="Write your review..."
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        required
        className="w-full border p-2 rounded"
      />

      <select
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        className="border p-2 rounded"
      >
        {[1, 2, 3, 4, 5].map((num) => (
          <option key={num} value={num}>
            {num} Star{num > 1 ? 's' : ''}
          </option>
        ))}
      </select>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit Review
      </button>

      {status && <p className="text-sm text-gray-600">{status}</p>}
    </form>
  );
};

export default ReviewForm;
