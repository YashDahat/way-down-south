import React from 'react';
import Layout from '../components/Layout';
import ReservationForm from '../components/ReservationForm';

const ReservationPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-6">
          Reserve Your Table at Way Down South
        </h1>
        <p className="text-lg text-center text-gray-700 mb-10">
          Experience the authentic flavors of South India. Book your table online for a memorable dining experience.
        </p>
        <ReservationForm />
      </div>
    </Layout>
  );
};

export default ReservationPage;