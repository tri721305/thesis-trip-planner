import React from "react";

interface TripCardInterface {
  tripTitle?: string;
  image?: string;
  star?: number;
  description?: string;
}

const TripCard = (props: TripCardInterface) => {
  const { tripTitle, image, star, description } = props;
  return (
    <div>
      TripCard
      <img src="" alt="" />
      <div>
        <h2>{tripTitle}</h2>
      </div>
    </div>
  );
};

export default TripCard;
