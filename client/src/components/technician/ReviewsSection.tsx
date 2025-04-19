import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Review, Technician, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";

// UI components 
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, StarHalf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface ReviewsSectionProps {
  technician: Technician & { user: User };
}

const ReviewsSection = ({ technician }: ReviewsSectionProps) => {
  const { t } = useTranslation();
  const [visibleReviews, setVisibleReviews] = useState(3);
  
  const { data: reviews, isLoading, error } = useQuery<Review[]>({
    queryKey: ['/api/reviews/technician', technician.id],
    queryFn: async () => {
      const res = await fetch(`/api/reviews/technician/${technician.id}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    }
  });

  const showMoreReviews = () => {
    setVisibleReviews(prev => prev + 3);
  };

  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    return stars;
  };

  if (isLoading) {
    return (
      <div className="space-y-4 mt-8">
        <h3 className="text-2xl font-bold">{t("Customer Reviews")}</h3>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-4">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mt-4" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 text-center">
        <h3 className="text-2xl font-bold mb-4">{t("Customer Reviews")}</h3>
        <p className="text-destructive">{t("Error loading reviews. Please try again later.")}</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-6">{t("Customer Reviews")}</h3>
      
      {reviews && reviews.length > 0 ? (
        <>
          <div className="space-y-6">
            {reviews.slice(0, visibleReviews).map((review) => (
              <Card key={review.id} className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {review.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{review.userName}</h4>
                        <div className="flex items-center mt-1">
                          {renderRatingStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-2">
                        {t(review.serviceType)}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {review.date ? formatDistanceToNow(new Date(review.date), { addSuffix: true }) : ''}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-muted-foreground">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {reviews.length > visibleReviews && (
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                onClick={showMoreReviews}
                className="mx-auto"
              >
                {t("Show More Reviews")}
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-muted-foreground italic">
          {t("No reviews yet for this technician.")}
        </p>
      )}
    </div>
  );
};

export default ReviewsSection;