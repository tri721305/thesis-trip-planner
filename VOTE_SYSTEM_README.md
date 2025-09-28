# Vote System for Travel Guides

This documentation describes the voting system implementation for travel guides, similar to the voting system in jsmasterypro_devflow project.

## 🗂️ Files Structure

```
lib/
  actions/
    vote.action.ts          # Vote server actions
  validation.ts            # Vote validation schemas

components/
  votes/
    VoteButtons.tsx         # Interactive vote buttons component
    VoteStats.tsx          # Vote statistics display component
    index.tsx              # Export file

database/
  vote.model.ts            # Vote MongoDB model
  guide.model.ts          # Guide model with vote fields

types/
  action.d.ts            # Vote action type definitions

app/
  test-vote/
    page.tsx             # Test page for vote functionality
```

## 📊 Database Schema

### Vote Model (`vote.model.ts`)

- `author` - ObjectId reference to User who voted
- `actionId` - ObjectId reference to the voted item (Guide)
- `actionType` - Enum: "guide" | "comment"
- `voteType` - Enum: "upvote" | "downvote"
- Automatic vote count updates via middleware
- Unique compound index to prevent duplicate votes

### Guide Model (`guide.model.ts`)

Enhanced with engagement fields:

- `upvotes` - Number (default: 0)
- `downvotes` - Number (default: 0)
- `views` - Number (default: 0)
- `comments` - Number (default: 0)

## 🔧 Server Actions

### `createVote(params: CreateVoteParams)`

- Creates, updates, or removes a vote
- Handles vote switching (upvote ↔ downvote)
- Updates vote counts automatically
- Uses MongoDB transactions for data consistency
- Parameters:
  ```typescript
  {
    targetId: string; // Guide ID
    targetType: "guide"; // Currently only supports guides
    voteType: "upvote" | "downvote";
  }
  ```

### `hasVoted(params: HasVotedParams)`

- Checks if current user has voted on a guide
- Returns current vote status
- Parameters:
  ```typescript
  {
    targetId: string; // Guide ID
    targetType: "guide"; // Currently only supports guides
  }
  ```
- Returns:
  ```typescript
  {
    hasUpvoted: boolean;
    hasDownvoted: boolean;
  }
  ```

### `incrementGuideViews(guideId: string)`

- Increments view count for a guide
- Called when a guide is viewed

## 🎨 Components

### `VoteButtons`

Interactive voting component with real-time updates:

- Upvote and downvote buttons
- Real-time count display
- Visual feedback for user's vote status
- Handles vote switching and removal
- Toast notifications for user feedback

**Props:**

```typescript
{
  targetId: string;           // Guide ID
  targetType: "guide";        // Vote target type
  upvotes?: number;          // Initial upvote count
  downvotes?: number;        // Initial downvote count
  className?: string;        // Additional CSS classes
}
```

### `VoteStats`

Display-only component for showing vote statistics:

- Upvote/downvote counts with icons
- Net score calculation
- Views and comments display
- Configurable labels

**Props:**

```typescript
{
  upvotes?: number;          // Upvote count
  downvotes?: number;        // Downvote count
  views?: number;           // View count
  comments?: number;        // Comment count
  className?: string;       // Additional CSS classes
  showLabels?: boolean;     // Show text labels
}
```

## 🔒 Validation Schemas

### `CreateVoteSchema`

```typescript
{
  targetId: string; // Required, min 1 character
  targetType: "guide"; // Enum validation
  voteType: "upvote" | "downvote"; // Enum validation
}
```

### `HasVotedSchema`

```typescript
{
  targetId: string; // Required
  targetType: "guide"; // Enum validation
}
```

## 📱 Usage Examples

### Basic Vote Buttons

```tsx
import { VoteButtons } from "@/components/votes";

<VoteButtons
  targetId={guide._id}
  targetType="guide"
  upvotes={guide.upvotes}
  downvotes={guide.downvotes}
/>;
```

### Vote Statistics Display

```tsx
import { VoteStats } from "@/components/votes";

<VoteStats
  upvotes={guide.upvotes}
  downvotes={guide.downvotes}
  views={guide.views}
  comments={guide.comments}
  showLabels={true}
/>;
```

### Complete Guide Card with Voting

```tsx
import { VoteButtons, VoteStats } from "@/components/votes";

export function GuideCard({ guide }) {
  return (
    <div className="guide-card">
      <h2>{guide.title}</h2>

      {/* Statistics */}
      <VoteStats
        upvotes={guide.upvotes}
        downvotes={guide.downvotes}
        views={guide.views}
        comments={guide.comments}
      />

      {/* Interactive voting */}
      <VoteButtons
        targetId={guide._id}
        targetType="guide"
        upvotes={guide.upvotes}
        downvotes={guide.downvotes}
      />
    </div>
  );
}
```

## 🧪 Testing

Test the vote system at `/test-vote` page:

1. **Prerequisites:**

   - User must be logged in
   - Ensure database connection is working
   - Replace mock guide ID with actual guide from database

2. **Test Steps:**

   - Navigate to `/test-vote`
   - Click upvote/downvote buttons
   - Verify real-time count updates
   - Test vote switching (upvote → downvote)
   - Test vote removal (click same button twice)
   - Check database for vote records

3. **Database Verification:**
   ```javascript
   // MongoDB queries to verify
   db.votes.find({ actionType: "guide" });
   db.travel_guides.find({}, { upvotes: 1, downvotes: 1 });
   ```

## 🚀 Features

### ✅ Implemented

- [x] Vote creation and management
- [x] Real-time vote count updates
- [x] Vote switching (upvote ↔ downvote)
- [x] Vote removal functionality
- [x] Database transaction safety
- [x] User vote status checking
- [x] Interactive vote components
- [x] Statistics display components
- [x] View count increment

### 🔄 Future Enhancements

- [ ] Comment voting support
- [ ] Vote history tracking
- [ ] Vote analytics and insights
- [ ] Rate limiting for votes
- [ ] Vote notifications
- [ ] Bulk vote operations
- [ ] Vote-based sorting and filtering

## 🔐 Security Features

- **Authentication Required:** All voting actions require user authentication
- **Unique Votes:** Database prevents duplicate votes per user
- **Transaction Safety:** MongoDB transactions ensure data consistency
- **Validation:** All inputs validated with Zod schemas
- **Error Handling:** Comprehensive error handling and user feedback

## 📈 Performance Considerations

- **Database Indexes:** Optimized indexes for vote queries
- **Automatic Updates:** Vote counts updated automatically via middleware
- **Efficient Queries:** Minimal database calls for vote operations
- **Real-time UI:** Immediate feedback without page refreshes

## 🐛 Troubleshooting

### Common Issues

1. **"Unauthorized" Error**

   - Ensure user is logged in
   - Check authentication middleware

2. **Vote Not Updating**

   - Verify database connection
   - Check vote model indexes
   - Ensure guide exists in database

3. **Component Not Loading**
   - Verify all imports are correct
   - Check if required UI components are installed
   - Ensure Suspense wrapper for client components

### Debug Commands

```bash
# Check database connection
npm run dev

# View logs
console.log in browser developer tools

# MongoDB queries
db.votes.find().sort({ createdAt: -1 }).limit(5)
db.travel_guides.find().limit(1)
```
