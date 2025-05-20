import { FaMapMarkerAlt } from "react-icons/fa";

import { Button } from "../ui/button";

const Search = () => {
  return (
    <div className="shadow-lg rounded-md p-4 text-dark200_light800 flex w-[80%] h-[4rem] justify-between">
      <section>
        Destination
        <FaMapMarkerAlt />
      </section>
      <section>Average Price</section>
      <section>Date</section>
      <Button className="primary-gradient btn-gradient">Explore</Button>
    </div>
  );
};

export default Search;
