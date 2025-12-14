// src/components/SearchBar.js
import { Search } from "lucide-react";
import { Input } from "@/app/(client)/components/ui/input";

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="relative max-w-2xl mx-auto animate-fade-in">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          type="text"
          placeholder="Search for dishes..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-12 h-12 text-base shadow-md border-2 focus:border-primary transition-all"
        />
      </div>
    </div>
  );
};

export default SearchBar;
