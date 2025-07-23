import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  MessageSquare,
  Search,
  Users,
  Clock,
  Plus,
  Loader2,
  Settings,
  Shield,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { DiscussionCard } from "../../components/discussions/DiscussionCard";
import {
  CreatePostModal,
  type CreatePostData,
} from "../../components/discussions";
import { TagFilter } from "../../components/discussions/TagFilter";

// Time formatting function for social media style timestamps
const formatTimeAgo = (timeString: string): string => {
  // Handle relative time strings (like "2h ago", "1d ago")
  if (timeString.includes("ago")) {
    return timeString;
  }

  // For actual dates, we would parse and format them
  // This is a mock implementation for the current data structure
  const now = new Date();
  const timeValue = timeString.toLowerCase();

  if (timeValue.includes("h")) {
    const hours = parseInt(timeValue);
    if (hours < 1) return "now";
    if (hours === 1) return "1h ago";
    return `${hours}h ago`;
  }

  if (timeValue.includes("d")) {
    const days = parseInt(timeValue);
    if (days === 1) return "1d ago";
    if (days <= 6) return `${days}d ago`;

    // For posts older than 6 days, show date in dd/mm/yyyy format
    const pastDate = new Date(now);
    pastDate.setDate(pastDate.getDate() - days);
    return pastDate.toLocaleDateString("en-GB"); // dd/mm/yyyy format
  }

  // For minute-level posts (if we had them)
  if (timeValue.includes("m") && !timeValue.includes("d")) {
    const minutes = parseInt(timeValue);
    if (minutes < 1) return "now";
    if (minutes === 1) return "1m ago";
    return `${minutes}m ago`;
  }

  return timeString;
};

// Custom debounce hook for better search performance
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Mock data for now - will be replaced with API calls
const allMockPosts = [
  {
    id: "1",
    title: "Best Pig Feed Suppliers in Kigali",
    content:
      "I'm looking for reliable feed suppliers who can deliver quality feed for 50+ pigs. Budget is around 500,000 RWF per month. Anyone have recommendations? I've been struggling to find consistent suppliers who deliver on time and maintain feed quality. My current supplier has been inconsistent with delivery schedules, and I've noticed some quality issues with the last few batches. The feed arrived with visible mold in some bags, which is completely unacceptable for pig health. I need suppliers who understand the importance of proper storage and handling. Ideally looking for someone who can provide nutritional analysis reports and has experience working with commercial pig farms. Also need someone who can work with flexible payment terms as cash flow can be tight during certain seasons.",
    author: {
      id: "user1",
      firstname: "John",
      lastname: "Farmer",
      avatar: null,
      level_id: 2,
      points: 245,
      location: "Kigali, Rwanda",
    },
    tags: ["Market", "Feed"],
    upvotes: 24,
    downvotes: 2,
    replies: 8,
    shares: 3,
    isMarketPost: true,
    isAvailable: true,
    createdAt: "5m ago",
    images: [
      "/images/post_image.jpg",
      "/images/post_image2.jpg",
      "/images/post_image3.jpg",
    ],
    video: null,
    isModeratorApproved: false, // Not approved yet
  },
  {
    id: "2",
    title: "Disease Prevention Tips for Young Pigs",
    content:
      "What are the most effective vaccination schedules and health monitoring practices for piglets under 3 months? I've been researching various protocols and there seems to be conflicting information online. Some sources recommend starting vaccinations at 6 weeks, while others suggest waiting until 8 weeks. I'm particularly concerned about preventing common diseases like swine flu, pneumonia, and parasitic infections that are common in our region. My vet recommended a specific schedule, but I'd love to hear from experienced farmers about what has worked best for them in practice. Also, what are the signs I should watch for that indicate a piglet might be getting sick? Early detection seems crucial for successful treatment. I've heard that stress from weaning can make piglets more susceptible to diseases, so I'm also looking for tips on making the weaning process as smooth as possible.",
    author: {
      id: "user2",
      firstname: "Sarah",
      lastname: "Expert",
      avatar: null,
      level_id: 3,
      points: 890,
      location: "Musanze, Rwanda",
    },
    tags: ["Health", "General"],
    upvotes: 45,
    downvotes: 1,
    replies: 12,
    shares: 8,
    isMarketPost: false,
    isAvailable: false,
    createdAt: "45m ago",
    images: [],
    video: "/images/post_video.mp4",
    isModeratorApproved: true,
  },
  {
    id: "3",
    title: "Organic Feed Recipe Sharing",
    content:
      "I've developed a cost-effective organic feed mix that increased my pigs' growth rate by 15%. Happy to share the recipe! After years of experimenting with different combinations, I've finally found a mix that works incredibly well for our local conditions. The recipe includes locally sourced ingredients like sweet potato vines, maize bran, soybean meal, and fish meal, plus some key supplements for optimal nutrition. What makes this special is that it costs about 30% less than commercial feeds while providing better results. The pigs seem to love the taste, and I've noticed improved coat quality and overall health. The growth rates have been consistently better than what I was achieving with commercial feeds. I've been tracking weight gains for over 6 months now, and the results speak for themselves. The recipe is scalable from small farms to larger operations. I'm happy to share the exact proportions and sourcing tips for each ingredient.",
    author: {
      id: "user3",
      firstname: "Mike",
      lastname: "Producer",
      avatar: null,
      level_id: 2,
      points: 654,
      location: "Nyagatare, Rwanda",
    },
    tags: ["Feed", "General"],
    upvotes: 32,
    downvotes: 0,
    replies: 15,
    shares: 12,
    isMarketPost: false,
    isAvailable: false,
    createdAt: "3h ago",
    images: ["/images/post_image.jpg", "/images/post_image2.jpg"],
    video: null,
    isModeratorApproved: true,
  },
  {
    id: "4",
    title: "Pig Housing Design for Small Farms",
    content:
      "Looking for advice on cost-effective pig housing solutions for a startup farm with 20 pigs. What materials work best in Rwanda's climate? I'm planning to build new pig pens and want to make sure I get the design right from the start. I've been reading about different flooring options - concrete vs. raised slatted floors vs. dirt floors. Each seems to have pros and cons in terms of cost, hygiene, and pig comfort. I'm also wondering about roof materials that can handle our heavy rains while keeping the pens cool during hot weather. Ventilation is another major concern - I want to ensure good air circulation without creating drafts that might make the pigs sick. I've seen some farms use bamboo construction which seems cost-effective, but I'm not sure about durability. My budget is limited, so I need solutions that are affordable but will last for many years. Any recommendations for local suppliers of building materials specifically suited for pig farming?",
    author: {
      id: "user4",
      firstname: "Agnes",
      lastname: "Startup",
      avatar: null,
      level_id: 1,
      points: 45,
      location: "Huye, Rwanda",
    },
    tags: ["General", "Equipment"],
    upvotes: 18,
    downvotes: 1,
    replies: 7,
    shares: 4,
    isMarketPost: false,
    isAvailable: false,
    createdAt: "6h ago",
    images: [],
    video: null,
    isModeratorApproved: false, // Not approved yet
  },
  {
    id: "5",
    title: "Selling Premium Pork - Butakera Market",
    content:
      "Fresh, organic pork available daily at Butakera Market. Free-range pigs, no antibiotics. Contact for wholesale prices. Our pigs are raised on a natural diet with plenty of space to roam and exercise, resulting in superior meat quality that you can taste. We've been in business for over 10 years and have built a reputation for consistency and quality. Our pigs are processed in a certified facility following all food safety protocols. We offer various cuts including fresh bacon, shoulder roasts, tenderloin, and ground pork. All our meat is vacuum-sealed for freshness and can be delivered to restaurants and hotels throughout Kigali. We also offer live pig sales for customers who prefer to process their own meat. Our breeding program focuses on hardy, fast-growing breeds that are well-adapted to local conditions. Customer satisfaction is our top priority, and we stand behind the quality of our products with a full satisfaction guarantee.",
    author: {
      id: "user5",
      firstname: "David",
      lastname: "Butcher",
      avatar: null,
      level_id: 2,
      points: 320,
      location: "Kigali, Rwanda",
    },
    tags: ["Market"],
    upvotes: 12,
    downvotes: 0,
    replies: 5,
    shares: 8,
    isMarketPost: true,
    isAvailable: true,
    createdAt: "1d ago",
    images: [
      "/images/post_image.jpg",
      "/images/post_image2.jpg",
      "/images/post_image3.jpg",
    ],
    video: null,
    isModeratorApproved: true, // Already approved
  },
  {
    id: "6",
    title: "Vaccination Schedule Questions",
    content:
      "New pig farmer here. Can someone share a comprehensive vaccination schedule for piglets? When should I start? I just acquired my first batch of 15 piglets and I want to make sure I'm doing everything right from the beginning. I've done a lot of reading, but there's so much conflicting information out there about timing, types of vaccines, and frequencies. My local vet gave me a basic schedule, but I'd really appreciate hearing from experienced farmers about what has worked best in practice. I'm particularly concerned about the timing of iron injections, which I've heard are crucial for preventing anemia in young pigs. Also, should I vaccinate pregnant sows differently? I'm planning to expand my breeding program next year and want to establish good protocols from the start. The health of my animals is my top priority, and I believe prevention is much better than treatment. I've also heard that stress can affect vaccine effectiveness, so I'm looking for tips on minimizing stress during vaccination. Any advice on keeping detailed health records would also be appreciated.",
    author: {
      id: "user6",
      firstname: "Peace",
      lastname: "Beginner",
      avatar: null,
      level_id: 1,
      points: 12,
      location: "Rubavu, Rwanda",
    },
    tags: ["Health"],
    upvotes: 25,
    downvotes: 0,
    replies: 18,
    shares: 6,
    isMarketPost: false,
    isAvailable: false,
    createdAt: "2d ago",
    images: [],
    video: null,
    isModeratorApproved: false, // Not approved yet
  },
  {
    id: "7",
    title: "Feed Mixing Equipment for Sale",
    content:
      "Selling a barely used feed mixer, capacity 500kg. Perfect for medium farms. Includes delivery within Kigali. This mixer has been a game-changer for our operation, but we're upgrading to a larger capacity unit to meet growing demand. The mixer is only 8 months old and has been properly maintained with regular cleaning and servicing. It features stainless steel construction that resists corrosion and is easy to sanitize. The mixing action is very thorough, ensuring consistent feed quality every time. It can handle various ingredients from fine powders to larger pellets and even allows for liquid additions during mixing. The unit includes a timer function and variable speed control for different mixing requirements. We've found it significantly reduces feed costs compared to buying pre-mixed feeds, and you have complete control over ingredient quality and nutritional content. The mixer comes with the original manual, warranty information, and spare parts we purchased. We can also provide training on operation and maintenance if needed.",
    author: {
      id: "user7",
      firstname: "Robert",
      lastname: "Equipment",
      avatar: null,
      level_id: 2,
      points: 180,
      location: "Kigali, Rwanda",
    },
    tags: ["Market", "Equipment"],
    upvotes: 8,
    downvotes: 0,
    replies: 3,
    shares: 2,
    isMarketPost: true,
    isAvailable: true,
    createdAt: "4d ago",
    images: [],
    video: "/images/post_video.mp4",
    isModeratorApproved: true, // Already approved
  },
  {
    id: "8",
    title: "Biosecurity Measures During Rainy Season",
    content:
      "With the rainy season approaching, what additional biosecurity measures should we implement to protect our herds? I've noticed that disease outbreaks tend to be more common during wet weather, and I want to make sure my farm is properly prepared. Last year we had some challenges with foot rot and respiratory issues that I believe were related to increased humidity and poor drainage. This year I want to be proactive rather than reactive. I'm particularly concerned about maintaining dry bedding areas and preventing the buildup of mud and standing water around feed and water stations. I've heard that certain diseases spread more easily in wet conditions, and I want to understand which specific risks increase during the rainy season. Should I modify my cleaning and disinfection protocols? Are there specific areas of the farm that need extra attention during wet weather? I'm also wondering about visitor protocols - should I be more restrictive about allowing people onto the farm when conditions are muddy? Any advice on footbaths, vehicle disinfection, and other preventive measures would be greatly appreciated.",
    author: {
      id: "user8",
      firstname: "Dr. Mary",
      lastname: "Veterinarian",
      avatar: null,
      level_id: 3,
      points: 1250,
      location: "Musanze, Rwanda",
    },
    tags: ["Health", "General"],
    upvotes: 38,
    downvotes: 2,
    replies: 14,
    shares: 11,
    isMarketPost: false,
    isAvailable: false,
    createdAt: "8d ago",
    images: [],
    video: null,
    isModeratorApproved: true, // Already approved
  },
  {
    id: "9",
    title: "Breeding Program Success Stories",
    content:
      "Share your breeding program results! What bloodlines have worked best for you in Rwanda's climate?",
    author: {
      id: "user9",
      firstname: "Paul",
      lastname: "Breeder",
      avatar: null,
      level_id: 2,
      points: 456,
      location: "Nyagatare, Rwanda",
    },
    tags: ["General"],
    upvotes: 21,
    downvotes: 1,
    replies: 9,
    shares: 5,
    isMarketPost: false,
    isAvailable: false,
    createdAt: "10d ago",
    images: ["/images/post_image.jpg"],
    video: null,
    isModeratorApproved: false, // Not approved yet
  },
  {
    id: "10",
    title: "Quality Piglets Available",
    content:
      "Premium Yorkshire piglets, 8 weeks old, vaccinated and healthy. Perfect for starting your pig farming journey. These piglets come from champion bloodlines with excellent growth rates and feed conversion efficiency. The mother sows have consistently produced large, healthy litters with minimal health issues. All piglets have received their initial vaccinations including iron shots and have been dewormed according to veterinary protocols. They've been weaned gradually to minimize stress and are already eating solid feed independently. Each piglet has been individually tagged and health records are provided with purchase. The Yorkshire breed is known for excellent mothering ability, fast growth, and lean meat production. These particular piglets have been raised in clean, spacious pens with proper ventilation and natural lighting. We provide ongoing support and advice to new pig farmers, including feeding recommendations, housing suggestions, and health monitoring tips. Transportation can be arranged within reasonable distance. We also offer a health guarantee - if any piglet becomes sick within the first two weeks, we'll provide veterinary consultation at no charge.",
    author: {
      id: "user10",
      firstname: "Grace",
      lastname: "Supplier",
      avatar: null,
      level_id: 2,
      points: 234,
      location: "Musanze, Rwanda",
    },
    tags: ["Market"],
    upvotes: 15,
    downvotes: 0,
    replies: 6,
    shares: 9,
    isMarketPost: true,
    isAvailable: true,
    createdAt: "15d ago",
    images: ["/images/post_image2.jpg", "/images/post_image3.jpg"],
    video: null,
    isModeratorApproved: false, // Not approved yet
  },
  {
    id: "11",
    title: "Feed Cost Optimization Strategies",
    content:
      "Looking for ways to reduce feed costs without compromising pig health. What strategies have worked for you? Feed represents about 70% of my total production costs, and with rising prices for commercial feeds, I need to find sustainable ways to reduce expenses. I've been exploring several options including growing my own feed crops, bulk purchasing cooperatives, and alternative protein sources. I'm particularly interested in learning about local feed ingredients that might be overlooked but provide good nutritional value. Has anyone tried using brewery waste, fruit processing byproducts, or vegetable scraps as feed supplements? I've read about sweet potato vines being an excellent source of nutrients for pigs, and they're relatively easy to grow here. I'm also considering setting up a small feed mill to process my own grains, but I'm not sure if the investment would pay off for a medium-sized operation like mine. Group purchasing with other farmers seems promising for getting better prices on feed ingredients. I'd love to hear about any cost-reduction strategies that have worked well while maintaining good pig health and growth rates.",
    author: {
      id: "user11",
      firstname: "James",
      lastname: "Economist",
      avatar: null,
      level_id: 1,
      points: 78,
      location: "Kigali, Rwanda",
    },
    tags: ["Feed", "General"],
    upvotes: 19,
    downvotes: 0,
    replies: 11,
    shares: 7,
    isMarketPost: false,
    isAvailable: false,
    createdAt: "20d ago",
    images: [],
    video: null,
    isModeratorApproved: true, // Already approved
  },
  {
    id: "12",
    title: "Manure Management Best Practices",
    content:
      "How do you handle pig manure on your farm? Looking for sustainable and profitable solutions.",
    author: {
      id: "user12",
      firstname: "Alice",
      lastname: "Environmentalist",
      avatar: null,
      level_id: 2,
      points: 345,
      location: "Huye, Rwanda",
    },
    tags: ["General"],
    upvotes: 23,
    downvotes: 1,
    replies: 13,
    shares: 4,
    isMarketPost: false,
    isAvailable: false,
    createdAt: "30d ago",
    images: [],
    video: null,
    isModeratorApproved: false, // Not approved yet
  },
];

const POSTS_PER_PAGE = 5; // Initial load: 5 posts
const POSTS_PER_LOAD_MORE = 2; // Subsequent loads: 2 posts each
const LOADING_DEBOUNCE_DELAY = 300; // 300ms debounce for search

const mockStats = {
  totalDiscussions: 12,
  postsToday: 2,
  marketOpportunitiesToday: 3,
  pointsToday: 12,
  currentRank: 15,
  rankChange: "up", // "up", "down", or "same"
};

const availableTags = [
  { name: "All", count: 12, color: "default" },
  { name: "General", count: 8, color: "blue" },
  { name: "Market", count: 4, color: "green" },
  { name: "Health", count: 3, color: "red" },
  { name: "Feed", count: 3, color: "yellow" },
  { name: "Equipment", count: 2, color: "purple" },
  { name: "Breeding", count: 0, color: "pink" },
  { name: "Disease", count: 0, color: "orange" },
  { name: "Nutrition", count: 0, color: "teal" },
];

type Post = (typeof allMockPosts)[0];

export function DiscussionsPage() {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce search query to prevent excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, LOADING_DEBOUNCE_DELAY);

  // Memoized filtered posts to prevent unnecessary recalculations
  const filteredAllPosts = useMemo(() => {
    return allMockPosts
      .filter((post: Post) => {
        const matchesSearch =
          post.title
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          post.content
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase());
        const matchesTag =
          selectedTag === "All" || post.tags.includes(selectedTag);
        return matchesSearch && matchesTag;
      })
      .map((post) => ({
        ...post,
        createdAt: formatTimeAgo(post.createdAt),
      }));
  }, [debouncedSearchQuery, selectedTag]);

  // Optimized load more posts function with abort controller for cancellation
  const loadMorePosts = useCallback(() => {
    if (isLoading || !hasMore) return;

    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setIsLoading(true);

    // Simulate API delay with shorter timeout for better UX
    const timeoutId = setTimeout(() => {
      if (signal.aborted) return;

      // Use POSTS_PER_LOAD_MORE (2) for subsequent loads after the initial 5
      const postsToLoad =
        currentPage === 2 ? POSTS_PER_LOAD_MORE : POSTS_PER_LOAD_MORE;
      const startIndex = displayedPosts.length; // Start from current displayed count
      const endIndex = startIndex + postsToLoad;
      const newPosts = filteredAllPosts.slice(startIndex, endIndex);

      console.log(
        `🔄 Loading posts ${startIndex + 1}-${Math.min(
          endIndex,
          filteredAllPosts.length
        )} of ${filteredAllPosts.length}`
      );

      if (newPosts.length === 0 || signal.aborted) {
        setHasMore(false);
        setIsLoading(false);
        console.log("📝 No more posts to load - infinite scroll complete!");
        return;
      }

      // Use functional update to prevent stale closure issues
      setDisplayedPosts((prev) => {
        // Prevent duplicate posts
        const existingIds = new Set(prev.map((post) => post.id));
        const uniqueNewPosts = newPosts.filter(
          (post) => !existingIds.has(post.id)
        );
        const updatedPosts = [...prev, ...uniqueNewPosts];
        console.log(
          `✅ Loaded ${uniqueNewPosts.length} new posts. Total displayed: ${updatedPosts.length}`
        );
        return updatedPosts;
      });

      setCurrentPage((prev) => prev + 1);

      // Check if we've loaded all available posts
      if (startIndex + newPosts.length >= filteredAllPosts.length) {
        setHasMore(false);
        console.log("🏁 All posts loaded!");
      }

      setIsLoading(false);
    }, 800); // Slightly longer delay to better see the loading states

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [
    currentPage,
    filteredAllPosts,
    isLoading,
    hasMore,
    displayedPosts.length,
  ]);

  // Reset displayed posts when filters change - optimized with debounced search
  useEffect(() => {
    // Cancel any pending loads when filters change
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(false);
    // Load initial 5 posts
    const initialPosts = filteredAllPosts.slice(0, POSTS_PER_PAGE);
    setDisplayedPosts(initialPosts);
    setCurrentPage(2); // Next load will be page 2
    setHasMore(filteredAllPosts.length > POSTS_PER_PAGE);

    console.log(
      `🚀 Initial load: ${initialPosts.length} posts of ${filteredAllPosts.length} total`
    );
    if (filteredAllPosts.length > POSTS_PER_PAGE) {
      console.log(
        `⏳ ${
          filteredAllPosts.length - POSTS_PER_PAGE
        } more posts available for infinite scroll`
      );
    }
  }, [debouncedSearchQuery, selectedTag, filteredAllPosts]);

  // Optimized intersection observer for infinite scroll with better threshold
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMorePosts();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px", // Start loading when element is 100px away
      }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [loadMorePosts, hasMore, isLoading]);

  const handleCreatePost = () => {
    setShowCreatePost(true);
  };

  // Memoized DiscussionCard component to prevent unnecessary re-renders
  const MemoizedDiscussionCard = useMemo(() => {
    return ({ post }: { post: Post }) => (
      <DiscussionCard key={post.id} post={post} />
    );
  }, []);

  // Enhanced loading states with progress information
  const LoadingSpinner = useMemo(
    () => (
      <div className="flex items-center justify-center gap-3 text-gray-500 py-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          <div className="text-center">
            <span className="text-sm font-medium block">
              Loading more discussions...
            </span>
          </div>
        </div>
      </div>
    ),
    []
  );

  const EndOfList = useMemo(
    () => (
      <div className="text-center text-gray-500 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-100 max-w-sm mx-auto">
          <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">
            All discussions loaded!
          </p>
        </div>
      </div>
    ),
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-2 sm:p-4 md:p-6 overflow-x-hidden">
      <div className="container mx-auto max-w-6xl">
        {/* Header Section */}
        <Card className="overflow-hidden shadow-2xl border-0 bg-white/80 backdrop-blur-sm w-full mb-6">
          <CardHeader className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 sm:gap-6">
                {/* Title and Stats */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold drop-shadow-sm">
                      Community Discussions
                    </h1>
                  </div>

                  {/* Stats Row */}
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
                      <span className="text-white/80">Total: </span>
                      <span className="text-white font-semibold">
                        {mockStats.totalDiscussions} discussions
                      </span>
                    </div>
                    <div className="bg-white/15 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
                      <span className="text-white/80">Your posts today: </span>
                      <span className="text-white font-semibold">
                        {mockStats.postsToday}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                  <Button
                    onClick={handleCreatePost}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 transition-all duration-300 backdrop-blur-sm cursor-pointer"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Start Discussion
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {/* Search Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Search with loading indicator */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 bg-white/50 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                />
                {/* Show loading indicator when search is being debounced */}
                {searchQuery !== debouncedSearchQuery && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Tag Filter */}
            <TagFilter
              tags={availableTags}
              selectedTag={selectedTag}
              onTagSelect={setSelectedTag}
            />
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Posts Feed - Order 2 on mobile, 1 on desktop */}
          <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
            {displayedPosts.length > 0 ? (
              <>
                {/* Virtualized post rendering for better performance */}
                <div className="space-y-4">
                  {displayedPosts.map((post) => (
                    <MemoizedDiscussionCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Optimized loading indicator with intersection observer target */}
                <div
                  ref={loadingRef}
                  className="flex justify-center py-4 min-h-[60px]"
                  aria-live="polite"
                  role="status"
                >
                  {isLoading && LoadingSpinner}
                  {!hasMore && displayedPosts.length > 0 && EndOfList}
                </div>
              </>
            ) : (
              <Card className="p-8 text-center bg-white/80 backdrop-blur-sm">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {debouncedSearchQuery || selectedTag !== "All"
                    ? "No discussions found"
                    : "No discussions yet"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {debouncedSearchQuery || selectedTag !== "All"
                    ? "Try adjusting your search or filter criteria"
                    : "Be the first to start a conversation!"}
                </p>
                <Button
                  onClick={handleCreatePost}
                  className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {debouncedSearchQuery || selectedTag !== "All"
                    ? "Create Discussion"
                    : "Create First Post"}
                </Button>
              </Card>
            )}
          </div>

          {/* Sidebar - Order 1 on mobile, 2 on desktop */}
          <div className="space-y-4 order-1 lg:order-2">
            {/* Community Stats */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-3">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-500" />
                  Stats
                </h3>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posts Today</span>
                    <span className="font-semibold text-orange-600">
                      {mockStats.postsToday}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Market Opportunities</span>
                    <span className="font-semibold text-green-600">
                      {mockStats.marketOpportunitiesToday}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Points Today</span>
                    <span className="font-semibold text-blue-600">
                      +{mockStats.pointsToday}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Rank</span>
                    <div className="flex items-center gap-1">
                      {mockStats.rankChange === "up" && (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      )}
                      {mockStats.rankChange === "down" && (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      {mockStats.rankChange === "same" && (
                        <Minus className="h-3 w-3 text-gray-400" />
                      )}
                      <span className="font-semibold text-purple-600">
                        #{mockStats.currentRank}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-gray-50/50">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <div className="p-1.5 bg-orange-100 rounded-lg">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  Quick Actions
                </h3>
              </CardHeader>
              <CardContent className="pt-0 p-0">
                <div className="space-y-0">
                  <button
                    onClick={handleCreatePost}
                    className="w-full p-4 flex items-center gap-3 text-left hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100/50 hover:cursor-pointer  transition-all duration-300 group border-b border-gray-100/50 last:border-b-0"
                  >
                    <div className="p-2 bg-orange-500 rounded-lg group-hover:bg-orange-600 transition-colors duration-300">
                      <Plus className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        Create Discussion
                      </span>
                      <p className="text-xs text-gray-500 group-hover:text-gray-600">
                        Start a new conversation
                      </p>
                    </div>
                  </button>
                  <button className="w-full p-4 flex items-center gap-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 hover:cursor-pointer transition-all duration-300 group border-b border-gray-100/50 last:border-b-0">
                    <div className="p-2 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors duration-300">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        Manage My Posts
                      </span>
                      <p className="text-xs text-gray-500 group-hover:text-gray-600">
                        View and edit your posts
                      </p>
                    </div>
                  </button>
                  <button className="w-full p-4 flex items-center gap-3 text-left hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/50 hover:cursor-pointer  transition-all duration-300 group border-b border-gray-100/50 last:border-b-0">
                    <div className="p-2 bg-purple-500 rounded-lg group-hover:bg-purple-600 transition-colors duration-300">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        Moderate Posts
                      </span>
                      <p className="text-xs text-gray-500 group-hover:text-gray-600">
                        Review community content
                      </p>
                    </div>
                  </button>
                  <button className="w-full p-4 flex items-center gap-3 text-left hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 hover:cursor-pointer  transition-all duration-300 group border-b border-gray-100/50 last:border-b-0">
                    <div className="p-2 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors duration-300">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        View Leaderboard
                      </span>
                      <p className="text-xs text-gray-500 group-hover:text-gray-600">
                        See top contributors
                      </p>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          onSubmit={(data: CreatePostData) => {
            console.log("Creating post:", data);
            setShowCreatePost(false);
          }}
        />
      </div>
    </div>
  );
}
