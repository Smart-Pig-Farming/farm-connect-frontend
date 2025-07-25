// Types for discussion posts
export interface Author {
  id: string;
  firstname: string;
  lastname: string;
  avatar: string | null;
  level_id: number;
  points: number;
  location: string;
}

export interface Reply {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  userVote?: "up" | "down" | null;
  replies?: Reply[]; // Nested replies for threading
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: Author;
  tags: string[];
  upvotes: number;
  downvotes: number;
  userVote?: "up" | "down" | null;
  replies: number;
  shares: number;
  isMarketPost: boolean;
  isAvailable: boolean;
  createdAt: string;
  images: string[];
  video: string | null;
  isModeratorApproved?: boolean;
  repliesData?: Reply[];
}

// Mock data for posts - will be replaced with API calls
export const allMockPosts: Post[] = [
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
    userVote: "down",
    replies: 7,
    shares: 3,
    isMarketPost: true,
    isAvailable: true,
    createdAt: "5m ago",
    images: [
      "/images/post_image.jpg",
      "/images/post_image2.jpg",
      "/images/post_image3.jpg",
      "/images/post_image4.jpg",
    ],
    video: null,
    isModeratorApproved: false, // Not approved yet
    repliesData: [
      {
        id: "reply1",
        content:
          "I've been working with Agro Solutions Ltd in Kigali for over 2 years. They have consistent quality and delivery. Their prices are competitive too. Contact them at +250 788 123 456.",
        author: {
          id: "user7",
          firstname: "Jean",
          lastname: "Baptiste",
          avatar: null,
          level_id: 3,
          points: 450,
          location: "Kigali, Rwanda",
        },
        createdAt: "3m ago",
        upvotes: 5,
        downvotes: 0,
        userVote: null,
      },
      {
        id: "reply2",
        content:
          "Avoid Cheap Feed Co. I had major quality issues with them last month. Lost 3 pigs due to contaminated feed. Stick with reputable suppliers only.",
        author: {
          id: "user8",
          firstname: "Marie",
          lastname: "Claire",
          avatar: null,
          level_id: 2,
          points: 280,
          location: "Nyanza, Rwanda",
        },
        createdAt: "1h ago",
        upvotes: 12,
        downvotes: 1,
        userVote: null,
        replies: [
          {
            id: "reply2-1",
            content: "I can confirm this. Had similar issues with them.",
            author: {
              id: "user10",
              firstname: "David",
              lastname: "Mugisha",
              avatar: null,
              level_id: 2,
              points: 340,
              location: "Butare, Rwanda",
            },
            createdAt: "45m ago",
            upvotes: 3,
            downvotes: 0,
            userVote: null,
          },
        ],
      },
      {
        id: "reply3",
        content:
          "For budget-friendly options, try mixing your own feed. I can share my recipe that costs 40% less than commercial feeds.",
        author: {
          id: "user9",
          firstname: "Patrick",
          lastname: "Farmer",
          avatar: null,
          level_id: 1,
          points: 120,
          location: "Musanze, Rwanda",
        },
        createdAt: "2h ago",
        upvotes: 8,
        downvotes: 1,
        userVote: "up",
        replies: [
          {
            id: "reply3-1",
            content: "Would love to see that recipe! Can you share it?",
            author: {
              id: "user11",
              firstname: "Alice",
              lastname: "Uwimana",
              avatar: null,
              level_id: 1,
              points: 85,
              location: "Kigali, Rwanda",
            },
            createdAt: "1h ago",
            upvotes: 2,
            downvotes: 0,
            userVote: null,
          },
          {
            id: "reply3-2",
            content:
              "I'll DM you the detailed recipe. It's worked great for my farm.",
            author: {
              id: "user9",
              firstname: "Patrick",
              lastname: "Farmer",
              avatar: null,
              level_id: 1,
              points: 120,
              location: "Musanze, Rwanda",
            },
            createdAt: "30m ago",
            upvotes: 4,
            downvotes: 0,
            userVote: null,
            replies: [
              {
                id: "reply3-2-1",
                content: "Thanks Patrick! This community is amazing.",
                author: {
                  id: "user11",
                  firstname: "Alice",
                  lastname: "Uwimana",
                  avatar: null,
                  level_id: 1,
                  points: 85,
                  location: "Kigali, Rwanda",
                },
                createdAt: "25m ago",
                upvotes: 1,
                downvotes: 0,
                userVote: null,
              },
            ],
          },
        ],
      },
    ],
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
    replies: 0,
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
    replies: 0,
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
    replies: 0,
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
    replies: 0,
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
    replies: 0,
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
    replies: 0,
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
    replies: 0,
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
    replies: 0,
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
    replies: 0,
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
    replies: 0,
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
    replies: 0,
    shares: 4,
    isMarketPost: false,
    isAvailable: false,
    createdAt: "30d ago",
    images: [],
    video: null,
    isModeratorApproved: false, // Not approved yet
  },
];

// Constants
export const POSTS_PER_PAGE = 5; // Initial load: 5 posts
export const POSTS_PER_LOAD_MORE = 2; // Subsequent loads: 2 posts each
export const LOADING_DEBOUNCE_DELAY = 300; // 300ms debounce for search

// Mock statistics
export const mockStats = {
  totalDiscussions: 12,
  postsToday: 2,
  marketOpportunitiesToday: 3,
  pointsToday: 12,
  currentRank: 15,
  rankChange: "up" as "up" | "down" | "same",
};

// Available tags for filtering
export const availableTags = [
  { name: "All", count: 12, color: "default" },
  { name: "General", count: 8, color: "blue" },
  { name: "Market", count: 4, color: "green" },
  { name: "Health", count: 3, color: "red" },
  { name: "Feed", count: 3, color: "yellow" },
  { name: "Equipment", count: 2, color: "purple" },
  { name: "Breeding", count: 0, color: "pink" },
  { name: "Events", count: 0, color: "orange" },
];

// Mock data for user post management
export const myPostsStats = {
  totalPosts: 8,
  published: 8,
  totalViews: 342,
  totalReplies: 23,
  totalUpvotes: 87,
  postsThisWeek: 2,
  avgEngagement: 4.2,
  topPerformingPost: "Best Pig Feed Suppliers in Kigali",
};

// Helper function to get posts by current user
export const getCurrentUserPosts = (currentUserId: string): Post[] => {
  return allMockPosts.filter(post => post.author.id === currentUserId);
};

// Helper function to get user post statistics
export const getUserPostStats = (currentUserId: string) => {
  const userPosts = getCurrentUserPosts(currentUserId);
  
  const totalViews = userPosts.reduce((sum, post) => {
    // In a real app, this would come from view tracking
    // For now, simulate based on upvotes and replies
    return sum + (post.upvotes * 5) + (post.replies * 3) + Math.floor(Math.random() * 20);
  }, 0);
  
  const totalReplies = userPosts.reduce((sum, post) => sum + post.replies, 0);
  const totalUpvotes = userPosts.reduce((sum, post) => sum + post.upvotes, 0);
  
  // Get posts from this week (mock calculation)
  const thisWeek = userPosts.filter(post => {
    // Simple mock - consider last 3 posts as "this week"
    const postIndex = allMockPosts.findIndex(p => p.id === post.id);
    return postIndex < 3;
  }).length;
  
  return {
    totalPosts: userPosts.length,
    published: userPosts.length, // All posts are published (no drafts)
    totalViews,
    totalReplies,
    totalUpvotes,
    postsThisWeek: thisWeek,
    avgEngagement: userPosts.length > 0 ? +(totalReplies + totalUpvotes) / userPosts.length : 0,
    topPerformingPost: userPosts.length > 0 ? userPosts[0].title : null,
  };
};
