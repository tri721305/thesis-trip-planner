# Guide System Class Diagram

```mermaid
classDiagram
    class Guide {
        +String title
        +String content
        +ObjectId author
        +Array tags
        +Number views
        +Number upvotes
        +Number downvotes
        +Number comments
        +String image
        +String location
        +Array details
        +Array highlights
        +String state
        +String type
        +Date createdAt
        +Date updatedAt
    }

    class User {
        +String name
        +String username
        +String email
        +String bio
        +String image
        +String location
        +String portfolio
        +Number reputation
        +String phone
    }

    class Comment {
        +ObjectId author
        +ObjectId guide
        +String content
        +Number upvotes
        +Number downvotes
        +ObjectId parentComment
        +Array replies
        +Boolean isDeleted
        +Date editedAt
        +Date createdAt
        +Date updatedAt
        +addReply(replyId)
        +removeReply(replyId)
        +markAsEdited()
        +softDelete()
    }

    class Vote {
        +ObjectId author
        +ObjectId actionId
        +String actionType
        +String voteType
        +Date createdAt
        +Date updatedAt
        +getVoteCounts()
        +getUserVote()
        +toggleVote()
    }

    class BaseDetail {
        <<abstract>>
        +String type
        +String name
        +Number index
    }

    class RouteDetail {
        +String name
        +Number index
        +Array data
    }

    class ListDetail {
        +String name
        +Number index
        +Array data
    }

    class BaseDataItem {
        <<abstract>>
        +String type
    }

    class NoteDataItem {
        +String content
    }

    class ChecklistDataItem {
        +Array items
        +Array completed
    }

    class PlaceDataItem {
        +String id
        +String name
        +String address
        +String description
        +Array categories
        +Array tags
        +String phone
        +String website
        +Array images
        +Array imageKeys
        +Number rating
        +Number numRatings
        +Number attractionId
        +Mixed priceLevel
        +Array openingPeriods
        +Object location
        +String timeStart
        +String timeEnd
        +Object cost
        +String note
    }

    class Cost {
        +String type
        +Number value
        +String paidBy
        +String description
        +Array splitBetween
    }

    class SplitBetween {
        +String userId
        +String name
        +Number amount
        +Boolean settled
        +Boolean selected
    }

    class Location {
        +Object address
        +Object coordinates
        +Object ward
        +Object district
        +Object province
        +String locationType
        +String description
        +String fullAddress
        +String fullAddressEn
        +Boolean isActive
    }

    Guide "1" -- "1" User : author
    Guide "1" -- "*" Comment : has
    Guide "1" -- "*" Vote : has votes where actionType=guide
    Guide "1" -- "*" BaseDetail : contains
    BaseDetail <|-- RouteDetail : extends
    BaseDetail <|-- ListDetail : extends
    RouteDetail "1" -- "*" BaseDataItem : contains
    ListDetail "1" -- "*" BaseDataItem : contains
    BaseDataItem <|-- NoteDataItem : extends
    BaseDataItem <|-- ChecklistDataItem : extends
    BaseDataItem <|-- PlaceDataItem : extends
    PlaceDataItem "1" -- "1" Cost : may have
    Cost "1" -- "*" SplitBetween : has
    Comment "1" -- "1" User : author
    Comment "1" -- "*" Comment : has replies
    Comment "1" -- "*" Vote : has votes where actionType=comment
    Vote "1" -- "1" User : author
    PlaceDataItem -- Location : references
```

## Class Descriptions

### Core Classes

#### Guide

- Central entity representing a travel guide
- Contains details about places, routes, and other information
- Can receive comments and votes

#### User

- Represents a user in the system
- Can be an author of guides and comments, or cast votes

#### Comment

- Represents a comment on a guide
- Can have nested replies
- Can receive upvotes and downvotes

#### Vote

- Represents a vote (upvote or downvote) on a guide or comment
- Links the voter (author) with the voted content

### Detail Structure

#### BaseDetail

- Abstract class for details within a guide
- Two concrete types: RouteDetail and ListDetail

#### RouteDetail

- Represents a route/itinerary for a specific part of the guide
- Contains various data items (places, notes, checklists)

#### ListDetail

- Represents a list of items (not route-based)
- Contains various data items like RouteDetail

### Data Items

#### BaseDataItem

- Abstract class for items within details
- Three concrete types: NoteDataItem, ChecklistDataItem, PlaceDataItem

#### NoteDataItem

- Simple text note item

#### ChecklistDataItem

- List of items that can be checked off

#### PlaceDataItem

- Detailed information about a place to visit
- Includes location, cost, timing information

### Supporting Classes

#### Cost

- Cost information that can be attached to PlaceDataItem
- Includes expense splitting functionality

#### SplitBetween

- Information about how costs are split among users

#### Location

- Detailed location information with administrative divisions

## Key Relationships

1. **Guide-User**: Each guide is authored by one user
2. **Guide-Comment**: A guide can have many comments
3. **Guide-Vote**: Users can upvote or downvote guides
4. **Guide-Detail**: A guide contains multiple details (routes or lists)
5. **Comment-User**: Each comment is authored by one user
6. **Comment-Comment**: Comments can have nested replies (parent-child relationship)
7. **Comment-Vote**: Comments can be upvoted or downvoted
8. **Detail-DataItem**: Details contain data items (notes, checklists, places)
