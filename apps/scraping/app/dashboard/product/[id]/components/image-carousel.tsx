import React, { useEffect, useState } from 'react'
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@workspace/ui/components/carousel"
import Image from "next/image"

interface ImageCarouselProps {
  images: string[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(1);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);
    setCount(api.scrollSnapList().length);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (!images || images.length === 0) {
    return (
      <Card className="w-[120px]">
        <CardContent className="p-0">
          <div className="relative h-[120px] w-[120px]">
            <Image
              src="/placeholder.svg"
              alt="No image available"
              fill
              className="object-cover rounded-sm"
              sizes="120px"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[120px]">
      <CardContent className="p-0 relative">
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: "start",
          }}
        >
          <CarouselContent>
            {images.map((src, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[120px] w-[120px]">
                  <Image
                    src={src || "/placeholder.svg"}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover rounded-sm"
                    sizes="120px"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && (
            <>
              <CarouselPrevious className="h-6 w-6 -left-3" />
              <CarouselNext className="h-6 w-6 -right-3" />
            </>
          )}
        </Carousel>
        {images.length > 1 && (
          <div className="absolute bottom-1 left-0 right-0 flex justify-center z-10">
            <div className="bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
              {current} / {count}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}