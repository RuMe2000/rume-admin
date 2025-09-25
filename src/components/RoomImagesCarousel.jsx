import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function RoomImagesCarousel({ images }) {
    if (!images || images.length === 0) {
        return <p className="text-gray-400 italic">No images available.</p>;
    }

    //react-slick settings
    const settings = {
        dots: true,             //show dots under slider
        infinite: true,         //infinite scroll
        speed: 500,             //transition speed
        slidesToShow: 1,        //show 1 image at a time
        slidesToScroll: 1,      //scroll 1 at a time
        arrows: true,           //show arrows
        adaptiveHeight: true,   //height adapts to image
    };

    return (
        <div className="w-full max-w-3xl"> {/* center and limit width */}
            <Slider {...settings}>
                {images.map((url, idx) => (
                    <div key={idx} className="flex justify-center">
                        <img
                            src={url}
                            alt={`Room image ${idx + 1}`}
                            className="rounded-2xl max-h-[400px] w-auto object-contain mx-auto border border-gray-400"
                        />
                    </div>
                ))}
            </Slider>
        </div>
    );
}
