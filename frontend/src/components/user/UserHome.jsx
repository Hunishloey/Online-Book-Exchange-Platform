import { useRef } from 'react';
import { MdOutlineKeyboardArrowRight, MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function UserHome() {
    const swiperRef = useRef(null);

    return (
        <section className="relative">
            <div className="relative h-screen max-h-[800px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gray-600 bg-opacity-30"></div>

                {/* Custom Buttons */}
                <button
                    className="group absolute right-4 xl:right-8 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
                    onClick={() => swiperRef.current?.slideNext()}
                >
                    <MdOutlineKeyboardArrowRight
                        size={40}
                        className="text-black group-hover:text-rose-400 transition-all duration-300"
                    />
                </button>

                <button
                    className="group absolute left-4 xl:left-8 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
                    onClick={() => swiperRef.current?.slidePrev()}
                >
                    <MdOutlineKeyboardArrowLeft
                        size={40}
                        className="text-black group-hover:text-rose-400 transition-all duration-300"
                    />
                </button>

                <Swiper
                    onSwiper={(swiper) => (swiperRef.current = swiper)}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false
                    }}
                    loop={true}
                    pagination={{
                        clickable: true,
                        el: '.swiper-pagination',
                        type: 'bullets',
                    }}
                    modules={[Navigation, Autoplay, Pagination]}
                    className="h-full w-full"
                >
                    {/* Slides */}
                    <SwiperSlide>
                        <div className="container mx-auto h-full flex items-center px-4 sm:px-6 lg:px-24">
                            <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between w-full gap-8 lg:gap-12">
                                <div className="lg:w-1/2 text-center lg:text-left space-y-6 z-10">
                                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                                        The Fine Print Book Collection
                                    </h2>
                                    <p className="text-lg sm:text-xl text-gray-100 max-w-lg">
                                        This was by 2024 batch student
                                    </p>
                                    <a
                                        href="#"
                                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg"
                                    >
                                        Shop Collection
                                    </a>
                                </div>
                                <div className="lg:w-1/2 flex justify-center z-10">
                                    <img
                                        src="/assets/images/banner-image2.png"
                                        className="w-full max-w-md lg:max-w-lg xl:max-w-xl object-contain"
                                        alt="banner"
                                    />
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>

                    <SwiperSlide>
                        <div className="container mx-auto h-full flex items-center px-4 sm:px-6 lg:px-24">
                            <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between w-full gap-8 lg:gap-12">
                                <div className="lg:w-1/2 text-center lg:text-left space-y-6 z-10">
                                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                                        How Innovation Works
                                    </h2>
                                    <p className="text-lg sm:text-xl text-gray-100 max-w-lg">
                                        Discount available. Grab it now!
                                    </p>
                                    <a
                                        href="#"
                                        className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg"
                                    >
                                        Reuse Books
                                    </a>
                                </div>
                                <div className="lg:w-1/2 flex justify-center z-10">
                                    <img
                                        src="/assets/images/banner-image1.png"
                                        className="w-full max-w-md lg:max-w-lg xl:max-w-xl object-contain"
                                        alt="banner"
                                    />
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>

                    <SwiperSlide>
                        <div className="container mx-auto h-full flex items-center px-4 sm:px-6 lg:px-24">
                            <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between w-full gap-8 lg:gap-12">
                                <div className="lg:w-1/2 text-center lg:text-left space-y-6 z-10">
                                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                                        Your Heart is the Sea
                                    </h2>
                                    <p className="text-lg sm:text-xl text-gray-100 max-w-lg">
                                        This is on 50% Discount
                                    </p>
                                    <a
                                        href="#"
                                        className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg"
                                    >
                                        Buy Now
                                    </a>
                                </div>
                                <div className="lg:w-1/2 flex justify-center z-10">
                                    <img
                                        src="/assets/images/banner-image.png"
                                        className="w-full max-w-md lg:max-w-lg xl:max-w-xl object-contain"
                                        alt="banner"
                                    />
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                </Swiper>

                {/* Custom Pagination */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 swiper-pagination !flex gap-2"></div>
            </div>
        </section>
    );
}
