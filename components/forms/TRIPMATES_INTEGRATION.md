# Hướng dẫn tích hợp TripmatesDialog vào PlannerForm

Để tích hợp TripmatesDialog vào PlannerForm, hãy thực hiện các bước sau:

## 1. Thêm import

```tsx
import TripmatesDialog from "./TripmatesDialog";
```

## 2. Thêm function refreshPlannerAfterTripmateChange

```tsx
// Thêm function này vào trước hàm handleSubmit
const refreshPlannerAfterTripmateChange = async () => {
  if (planner) {
    try {
      const plannerId = planner._id || planner.id;
      if (!plannerId) return;

      const refreshedPlanner = await getPlannerById({ plannerId });

      if (refreshedPlanner.success && refreshedPlanner.data) {
        setCurrentPlannerData(refreshedPlanner.data);
        form.setValue("tripmates", refreshedPlanner.data.tripmates || []);
        updateStore();
        syncAllExpensesWithTripmates();

        toast({
          title: "Tripmates updated",
          description:
            "Your travel companions list has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error refreshing tripmates:", error);
    }
  }
};
```

## 3. Thêm TripmatesDialog vào giao diện PlannerForm

Tìm đến phần render chính của form, ngay sau phần tiêu đề và thêm component TripmatesDialog:

```tsx
{
  /* Thêm vào sau phần header và thông tin cơ bản của form */
}
<div className="flex flex-col space-y-4">
  <div className="flex justify-between items-center">
    <h3 className="text-lg font-medium">Tripmates & Sharing</h3>

    {/* Thêm TripmatesDialog ở đây */}
    {planner && planner.id && (
      <TripmatesDialog
        plannerId={planner.id}
        isAuthor={planner.author === currentUser?.id} // Thay bằng cách xác định author phù hợp
        currentTripmates={form.getValues("tripmates") || []}
        onTripmateChange={refreshPlannerAfterTripmateChange}
      />
    )}
  </div>

  {/* Các phần khác của form */}
</div>;
```

## 4. Cách xác định user có phải là author

Nếu bạn chưa có biến currentUser, bạn có thể lấy thông tin session để xác định:

```tsx
// Thêm near the top of component
const [currentUser, setCurrentUser] = useState<any>(null);

// Thêm useEffect để lấy thông tin user
useEffect(() => {
  const getCurrentUser = async () => {
    try {
      // Đây là một cách giả định, thay thế bằng cách bạn lấy thông tin user trong dự án
      const session = await auth();
      if (session?.user) {
        setCurrentUser(session.user);
      }
    } catch (error) {
      console.error("Error getting current user:", error);
    }
  };

  getCurrentUser();
}, []);
```

## 5. Cách kiểm tra user là author

```tsx
// Kiểm tra user có phải là author không
const isUserAuthor =
  planner &&
  currentUser &&
  (planner.author === currentUser.id ||
    planner.author?._id === currentUser.id ||
    planner.author === currentUser._id);
```

Sử dụng isUserAuthor trong TripmatesDialog:

```tsx
<TripmatesDialog
  plannerId={planner.id}
  isAuthor={isUserAuthor}
  currentTripmates={form.getValues("tripmates") || []}
  onTripmateChange={refreshPlannerAfterTripmateChange}
/>
```
