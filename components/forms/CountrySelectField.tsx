import { Controller } from "react-hook-form";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COUNTRIES = [
    { value: 'MX', label: 'Mexico', code: 'mx' },
    { value: 'US', label: 'United States', code: 'us' },
    { value: 'CA', label: 'Canada', code: 'ca' },
    { value: 'UK', label: 'United Kingdom', code: 'gb' },
    { value: 'AU', label: 'Australia', code: 'au' },
    { value: 'DE', label: 'Germany', code: 'de' },
    { value: 'FR', label: 'France', code: 'fr' },
    { value: 'ES', label: 'Spain', code: 'es' },
    { value: 'IT', label: 'Italy', code: 'it' },
    { value: 'BR', label: 'Brazil', code: 'br' },
    { value: 'AR', label: 'Argentina', code: 'ar' },
    { value: 'JP', label: 'Japan', code: 'jp' },
    { value: 'CN', label: 'China', code: 'cn' },
    { value: 'IN', label: 'India', code: 'in' },
];

const CountrySelectField = ({ name, label, control, error, required }: CountrySelectProps) => {
    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="form-label">
                {label}
            </Label>

            <Controller
                name={name}
                control={control}
                rules={{
                    required: required ? `Please select your country` : false
                }}
                render={({ field }) => (
                    <>
                        <Select value={field.value || undefined} onValueChange={field.onChange}>
                            <SelectTrigger className="select-trigger">
                                <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600 text-white">
                                {COUNTRIES.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className="focus:bg-gray-600 focus:text-white">
                                        <div className="flex items-center gap-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img 
                                                src={`https://flagcdn.com/w20/${option.code}.png`} 
                                                srcSet={`https://flagcdn.com/w40/${option.code}.png 2x`} 
                                                alt={option.label} 
                                                className="w-5 h-auto rounded-sm"
                                            />
                                            <span>{option.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {error && <p className="text-sm text-red-500 mt-1">{error.message}</p>}
                    </>
                )}
            />
        </div>
    )
}

export default CountrySelectField