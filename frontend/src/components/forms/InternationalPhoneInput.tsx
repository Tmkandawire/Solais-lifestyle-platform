import PhoneInput from "react-phone-number-input";
import type { Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface InternationalPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  defaultCountry?: Country;
  placeholder?: string;
}

export default function InternationalPhoneInput({
  value,
  onChange,
  label = "Phone Number",
  required = false,
  defaultCountry = "ZM",
  placeholder = "Enter phone number",
}: InternationalPhoneInputProps) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.28em] text-[#172526]/55">
        {label}
        {required && (
          <>
            {" "}
            <span className="text-[#C99A5B]">*</span>
          </>
        )}
      </label>

      <PhoneInput
        international
        countryCallingCodeEditable={false}
        defaultCountry={defaultCountry}
        value={value || undefined}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        placeholder={placeholder}
        className="international-phone-input"
      />
    </div>
  );
}
