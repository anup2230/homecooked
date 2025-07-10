"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, PlusCircle, Sparkles, X } from 'lucide-react';
import { getTagSuggestions } from './actions';
import { useToast } from "@/hooks/use-toast"

const listingFormSchema = z.object({
  name: z.string().min(3, 'Dish name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  photo: z.any().refine(file => file, 'A photo of the dish is required.'),
  tags: z.array(z.string()).min(1, 'At least one tag is required.'),
  deliveryOptions: z.array(z.string()).refine(value => value.some(item => item), {
    message: "You have to select at least one delivery option.",
  }),
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

const deliveryOptions = [
  { id: 'pickup', label: 'Customer Pickup' },
  { id: 'drop-off', label: 'Local Drop-off' },
] as const;

export function CreateListingForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const { toast } = useToast()

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      tags: [],
      deliveryOptions: ['pickup'],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tags"
  });

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('photo', file);
      const reader = new FileReader();
      reader.onloadstart = () => {
        setIsSuggesting(true);
        setSuggestedTags([]);
      };
      reader.onloadend = async (e) => {
        const dataUrl = e.target?.result as string;
        setImagePreview(dataUrl);
        
        const result = await getTagSuggestions(dataUrl);
        if ('error' in result) {
            toast({
              variant: "destructive",
              title: "AI Suggestion Failed",
              description: result.error,
            })
        } else {
            setSuggestedTags(result.tags);
        }
        setIsSuggesting(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !fields.some(field => field.value === trimmedTag)) {
      append(trimmedTag);
      setSuggestedTags(prev => prev.filter(t => t.toLowerCase() !== trimmedTag.toLowerCase()));
    }
  };
  
  const handleAddCustomTag = () => {
    if (newTag) {
        addTag(newTag);
        setNewTag('');
    }
  };

  function onSubmit(data: ListingFormValues) {
    console.log(data);
    toast({
      title: "Listing Submitted!",
      description: "Your dish has been successfully submitted for review.",
    })
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">List a new dish</CardTitle>
        <CardDescription>Fill out the details below to add your creation to Homecooked.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dish Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Classic Beef Lasagna" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your dish..." className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                         <Input type="number" step="0.01" placeholder="15.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dish Photo</FormLabel>
                      <FormControl>
                        <Input type="file" accept="image/*" onChange={handleImageChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {imagePreview && (
                  <div className="relative w-full h-48 rounded-md overflow-hidden border">
                    <Image src={imagePreview} alt="Dish preview" fill objectFit="cover" />
                  </div>
                )}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="deliveryOptions"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Delivery Options</FormLabel>
                    <FormDescription>
                      Select how customers can receive this dish.
                    </FormDescription>
                  </div>
                  {deliveryOptions.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="deliveryOptions"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="flex flex-wrap gap-2">
                {fields.map((field, index) => (
                  <Badge key={field.id} variant="secondary" className="pl-3 pr-1 py-1 text-sm">
                    {field.value}
                    <button type="button" onClick={() => remove(index)} className="ml-1 rounded-full p-0.5 hover:bg-destructive/20">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
               <FormMessage>{form.formState.errors.tags?.message}</FormMessage>
            </FormItem>

            {isSuggesting && (
              <div className="flex items-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Suggesting tags based on your photo...</span>
              </div>
            )}

            {suggestedTags.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span>AI Suggestions</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {suggestedTags.map(tag => (
                            <Button key={tag} type="button" variant="outline" size="sm" onClick={() => addTag(tag)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                {tag}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="flex gap-2">
              <Input
                placeholder="Add a custom tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddCustomTag}>
                Add Tag
              </Button>
            </div>


            <Button type="submit" size="lg" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              List My Dish
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
