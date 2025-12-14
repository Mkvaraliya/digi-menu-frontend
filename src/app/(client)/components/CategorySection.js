import Image from "next/image";
import { Card } from "@/app/(client)/components/ui/card";

const CategorySection = ({
  categories = [],
  selectedCategoryId,
  selectedCategoryName,
  selectedSubcategoryId,
  onSelectCategory,
  onSelectSubcategory,
}) => {
  // find the active category to show its subcategories
  const activeCategory =
    categories.find((c) => c.id === selectedCategoryId) || null;

  return (
    <section className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Categories</h2>

      {/* CATEGORY ROW (horizontal scroll) */}
            {/* CATEGORY ROW (horizontal scroll) */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {/* All dishes card */}
        <div
          onClick={() => onSelectCategory("all", "all")}
          className={`min-w-[140px] cursor-pointer transition-all hover:scale-100 hover:shadow-lg rounded-xl ${
            selectedCategoryName === "all"
              ? "border-2 border-primary"
              : "border border-transparent"
          }`}
        >
          <Card className="rounded-xl border-0">
            <div className="p-4 text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl">
                🍽️
              </div>
              <h3 className="font-semibold">All Dishes</h3>
            </div>
          </Card>
        </div>

        {/* Dynamic categories from backend */}
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => onSelectCategory(category.id, category.name)}
            className={`min-w-[140px] cursor-pointer transition-all hover:scale-100 hover:shadow-lg rounded-xl ${
              selectedCategoryName === category.name
                ? "border-2 border-primary"
                : "border border-transparent"
            }`}
          >
            <Card className="rounded-xl border-0">
              <div className="p-4 text-center">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={80}
                    height={80}
                    className="mx-auto mb-3 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl">
                    🍛
                  </div>
                )}
                <h3 className="font-semibold text-sm">{category.name}</h3>
              </div>
            </Card>
          </div>
        ))}
      </div>


      {/* SUBCATEGORY ROW (only when a category is selected) */}
      {activeCategory && activeCategory.subcategories.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-3">
            Subcategories · {activeCategory.name}
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {/* All subcategories for this category */}
            <Card
              onClick={() => onSelectSubcategory("")}
              className={`px-2 py-2 min-w-[120px] text-center cursor-pointer rounded-md border transition-all hover:shadow-md ${!selectedSubcategoryId
                  ? "bg-primary text-primary-foreground"
                  : "bg-card"
                }`}
            >
              <span className="text-sm font-medium">
                All {activeCategory.name}
              </span>
            </Card>

            {activeCategory.subcategories.map((sub) => (
              <Card
                key={sub.id}
                onClick={() => onSelectSubcategory(sub.id)}
                className={`px-2 py-2 min-w-[120px] text-center cursor-pointer rounded-md border transition-all hover:shadow-md ${selectedSubcategoryId === sub.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card"
                  }`}
              >
                <span className="text-sm font-medium">{sub.name}</span>
              </Card>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default CategorySection;
