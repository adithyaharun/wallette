/** biome-ignore-all lint/a11y/noStaticElementInteractions: Please */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: Please */
/** biome-ignore-all lint/a11y/noRedundantAlt: Please */
/** biome-ignore-all lint/a11y/noNoninteractiveTabindex: For the love of God please */
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useObjectUrl } from "../../hooks/use-object-url";
import { Button } from "../ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

type ImagePreviewDialogProps = {
  images: (File | Blob)[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
};

export function ImagePreviewDialog({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
}: ImagePreviewDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [api, setApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (isOpen) {
      api?.scrollTo(initialIndex);
    }
  }, [isOpen, initialIndex, api]);

  const goToPrevious = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const goToNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [goToPrevious, goToNext, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-full md:max-w-4xl rounded-lg flex flex-col p-0"
        style={{
          height: `calc(100% - 2rem - env(safe-area-inset-bottom) - env(safe-area-inset-top))`,
        }}
      >
        <DialogHeader className="px-4 min-h-16 flex justify-center">
          <DialogTitle>&nbsp;</DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex items-center">
          <Carousel setApi={setApi}>
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem
                  key={index}
                  className="flex items-center justify-center"
                >
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Image ${index + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
        <div className="h-16 pb-safe flex justify-center items-center px-4 gap-4">
          <Button size="icon" variant="outline" onClick={goToPrevious}>
            <ChevronLeftIcon />
          </Button>
          <span>
            {currentIndex + 1} of {images.length}
          </span>
          <Button size="icon" variant="outline" onClick={goToNext}>
            <ChevronRightIcon />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
