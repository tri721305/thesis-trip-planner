import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import "./style.css";

const BorderCard = () => {
  return (
    <div className="cardborder">
      <div className="cardborder-img">
        <img src={"./images/ocean.jpg"} alt="bg" />
      </div>
      <div className="cardborder-tag">
        <Button className="primary-gradient">
          Explore <ArrowRightIcon />
        </Button>
      </div>
      <div className="curve_one "></div>
      <div className="curve_two"></div>
    </div>
  );
};

export default BorderCard;
