import { useState, useEffect } from "react";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { locationData } from "@/data/location";

interface LocationSelectorProps {
  province?: string;
  district?: string;
  sector?: string;
  onLocationChange: (location: {
    province: string;
    district: string;
    sector: string;
  }) => void;
  disabled?: boolean;
  error?: string;
}

export function LocationSelector({
  province = "",
  district = "",
  sector = "",
  onLocationChange,
  disabled = false,
  error,
}: LocationSelectorProps) {
  const [selectedProvince, setSelectedProvince] = useState(province);
  const [selectedDistrict, setSelectedDistrict] = useState(district);
  const [selectedSector, setSelectedSector] = useState(sector);

  // Get provinces
  const provinces = Object.keys(locationData).map((prov) => ({
    value: prov,
    label: prov,
  }));

  // Get districts for selected province
  const districts = selectedProvince
    ? Object.keys(
        locationData[selectedProvince as keyof typeof locationData] || {}
      ).map((dist) => ({
        value: dist,
        label: dist,
      }))
    : [];

  // Get sectors for selected district
  const sectors =
    selectedProvince && selectedDistrict
      ? (
          (
            locationData[
              selectedProvince as keyof typeof locationData
            ] as Record<string, string[]>
          )?.[selectedDistrict] || []
        ).map((sect: string) => ({
          value: sect,
          label: sect,
        }))
      : [];

  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedSector) {
      onLocationChange({
        province: selectedProvince,
        district: selectedDistrict,
        sector: selectedSector,
      });
    }
  }, [selectedProvince, selectedDistrict, selectedSector, onLocationChange]);

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setSelectedDistrict("");
    setSelectedSector("");
  };

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setSelectedSector("");
  };

  const handleSectorChange = (value: string) => {
    setSelectedSector(value);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="province">Province</Label>
        <Select
          id="province"
          options={provinces}
          value={selectedProvince}
          onChange={(e) => handleProvinceChange(e.target.value)}
          placeholder="Select Province"
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="district">District</Label>
        <Select
          id="district"
          options={districts}
          value={selectedDistrict}
          onChange={(e) => handleDistrictChange(e.target.value)}
          placeholder="Select District"
          disabled={disabled || !selectedProvince}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sector">Sector</Label>
        <Select
          id="sector"
          options={sectors}
          value={selectedSector}
          onChange={(e) => handleSectorChange(e.target.value)}
          placeholder="Select Sector"
          disabled={disabled || !selectedDistrict}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
