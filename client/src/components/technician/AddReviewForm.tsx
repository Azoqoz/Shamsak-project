import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Technician, User, insertReviewSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { CardContent, Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SERVICE_TYPES } from "@/lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddReviewFormProps {
  technician: Technician & { user: User };
  onSuccess?: () => void;
}

const extendedSchema = insertReviewSchema
  .extend({
    rating: z.coerce.number().min(1).max(5),
  })
  .omit({ id: true, date: true, userId: true, technicianId: true });

type FormValues = z.infer<typeof extendedSchema>;

const AddReviewForm = ({ technician, onSuccess }: AddReviewFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: FormValues = {
    rating: 5,
    serviceType: "installation",
    userName: "",
    comment: "",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(extendedSchema),
    defaultValues,
  });

  const addReviewMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const reviewData = {
        ...data,
        technicianId: technician.id,
      };
      const response = await apiRequest("POST", "/api/reviews", reviewData);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to submit review");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      form.reset(defaultValues);
      setIsSubmitting(false);
      
      // Invalidate technician reviews query
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/technician', technician.id] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error submitting review",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    addReviewMutation.mutate(data);
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <h4 className="text-lg font-semibold mb-4">Add Your Review</h4>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SERVICE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.value.charAt(0).toUpperCase() + type.value.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating (1-5)</FormLabel>
                  <FormControl>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          type="button"
                          variant={field.value >= rating ? "default" : "outline"}
                          className={`w-10 h-10 p-0 ${field.value >= rating ? "bg-yellow-400 hover:bg-yellow-500" : ""}`}
                          onClick={() => field.onChange(rating)}
                        >
                          {rating}
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience with this technician"
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddReviewForm;