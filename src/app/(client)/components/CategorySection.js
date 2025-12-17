import { Card } from "@/app/(client)/components/ui/card";

const CategorySection = ({
  categories = [],
  selectedCategoryId,
  selectedCategoryName,
  selectedSubcategoryId,
  onSelectCategory,
  onSelectSubcategory,
}) => {
  const activeCategory =
    categories.find((c) => c.id === selectedCategoryId) || null;

  return (
    <section className="container mx-auto px-4 py-2">
      <h2 className="text-2xl font-bold mb-2">Categories</h2>

      {/* CATEGORY ROW */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {/* All */}
        <button
          onClick={() => onSelectCategory("all", "all")}
          className={`min-w-[120px] h-12 px-5 rounded-full text-sm font-medium transition-all whitespace-nowrap
            ${
              selectedCategoryName === "all"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            }`}
        >
          All
        </button>

        {/* Dynamic Categories */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id, category.name)}
            className={`min-w-[120px] h-12 px-5 rounded-full text-sm font-medium transition-all whitespace-nowrap
              ${
                selectedCategoryName === category.name
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* SUBCATEGORY ROW */}
      {activeCategory && activeCategory.subcategories.length > 0 && (
        <div className="mt-5">
          <h3 className="text-lg font-semibold mb-2">
            Subcategories · {activeCategory.name}
          </h3>

          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            <Card
              onClick={() => onSelectSubcategory("")}
              className={`px-4 py-2 min-w-[120px] text-center cursor-pointer rounded-md border transition-all
                ${
                  !selectedSubcategoryId
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card hover:bg-muted"
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
                className={`px-4 py-2 min-w-[120px] text-center cursor-pointer rounded-md border transition-all
                  ${
                    selectedSubcategoryId === sub.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card hover:bg-muted"
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
