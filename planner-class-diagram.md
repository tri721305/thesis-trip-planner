# Planner System Class Diagram

```mermaid
classDiagram
    class TravelPlan {
        +String title
        +String image
        +String note
        +ObjectId author
        +Array tripmates
        +String state
        +String type
        +Object destination
        +Date startDate
        +Date endDate
        +String generalTips
        +Array lodging
        +Array details
        +calculateTotalExpenses()
        +generateSettlement()
        +getExpensesByPerson(String personName)
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

    class Hotel {
        +String offerId
        +Object lodging
        +String source
        +Array priceRates
        +Object priceRate
        +Boolean includesDueAtPropertyFees
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

    class Lodging {
        +String name
        +String address
        +Date checkIn
        +Date checkOut
        +String confirmation
        +String notes
        +Object cost
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

    class Tripmate {
        +String name
        +String email
        +String image
        +ObjectId userId
    }

    class Destination {
        +String name
        +Array coordinates
        +String type
        +String provinceId
        +String wardId
    }

    TravelPlan "1" -- "1" User : author
    TravelPlan "1" -- "*" Tripmate : has
    TravelPlan "1" -- "1" Destination : has
    TravelPlan "1" -- "*" BaseDetail : contains
    BaseDetail <|-- RouteDetail : extends
    BaseDetail <|-- ListDetail : extends
    RouteDetail "1" -- "*" BaseDataItem : contains
    ListDetail "1" -- "*" BaseDataItem : contains
    BaseDataItem <|-- NoteDataItem : extends
    BaseDataItem <|-- ChecklistDataItem : extends
    BaseDataItem <|-- PlaceDataItem : extends
    TravelPlan "1" -- "*" Lodging : has
    Lodging "1" -- "1" Cost : may have
    PlaceDataItem "1" -- "1" Cost : may have
    Cost "1" -- "*" SplitBetween : has
    TravelPlan -- Location : references
    TravelPlan -- Hotel : references
```

## Class Descriptions

### Core Classes

#### TravelPlan

- Central entity that represents a travel plan/itinerary
- Contains all information about a trip including destinations, lodging, details
- Has methods for expense calculations and settlements

#### User

- Represents a user in the system
- Can be an author of a travel plan or a tripmate

#### Tripmate

- Represents a participant in the travel plan
- Can be linked to a User or just have basic information

### Detail Structure

#### BaseDetail

- Abstract class for details within a travel plan
- Two concrete types: RouteDetail and ListDetail

#### RouteDetail

- Represents a route/itinerary for a specific day
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

#### Lodging

- Accommodation information
- Includes check-in/check-out dates, costs

#### Cost

- Cost information that can be attached to Lodging or PlaceDataItem
- Includes expense splitting functionality

#### SplitBetween

- Information about how costs are split among tripmates

#### Destination

- Main destination information for the travel plan

#### Location

- Detailed location information with administrative divisions

#### Hotel

- Detailed hotel information from external API integration
