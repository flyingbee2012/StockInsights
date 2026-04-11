# API Data Format Documentation

## Overview

This document specifies the exact data format expected by the StockInsights application's API endpoints. **This format must not be changed without updating the corresponding parsing logic.**

## Critical Importance

The `ApiService.convertRawDataToList()` method has strict parsing requirements. If the API data format changes:
1. Update the parsing logic in `ApiService.ts`
2. Update this documentation
3. Update the mock data in `src/data/mockApiData.json`
4. Test thoroughly with real API responses

**Important:** All elements in the array are data elements - there is no header element.

## Stock Data Endpoint Format

**Endpoint:** `GET /:symbol` (e.g., `GET /AAPL`)

### Expected Response Format

```json
[
  "{\"Date\":\"12/1/2022\",\"Open\":20.5,\"High\":21.0,\"Low\":20.2,\"Close\":20.8,\"Volume\":1500000}",
  "{\"Date\":\"12/2/2022\",\"Open\":20.8,\"High\":21.5,\"Low\":20.5,\"Close\":21.2,\"Volume\":1383500}",
  "{\"Date\":\"12/5/2022\",\"Open\":21.2,\"High\":21.3,\"Low\":20.1,\"Close\":20.15,\"Volume\":2100000}"
]
```

### Format Specification

| Aspect | Requirement | Example |
|--------|-------------|---------|
| **Container** | Array of strings | `["string1", "string2"]` |
| **Element Type** | JSON string (stringified JSON object) | `"{\"Date\":\"12/1/2022\",...}"` |
| **Data Elements** | All elements contain actual price data | No header element |
| **Consistency** | All elements should have same field structure | Used for data integrity validation |

### Required Fields (Each Data Object)

| Field | Type | Format | Example | Notes |
|-------|------|--------|---------|-------|
| `Date` | String | MM/dd/yyyy | `"12/1/2022"` | Must be parseable by JS Date |
| `Open` | Number | Decimal | `20.5` | Opening price |
| `High` | Number | Decimal | `21.0` | Day's high price |
| `Low` | Number | Decimal | `20.2` | Day's low price |
| `Close` | Number | Decimal | `20.8` | Closing price |
| `Volume` | Number | Integer | `1500000` | Trading volume |

### Parser Logic

```typescript
// 1. Parse outer array
const parsedData = JSON.parse(data);

// 2. Get expected field count from first data element (index 0)
const headerLength = Object.keys(JSON.parse(parsedData[0])).length;

// 3. Process each data element (starting from index 0)
for (let i = 0; i < parsedData.length; i++) {
  const priceObject = JSON.parse(parsedData[i]);
  
  // 4. Validate field count matches first element for consistency
  if (Object.keys(priceObject).length === headerLength) {
    // 5. Extract and convert fields
    const price = {
      dateTime: priceObject.Date,           // Keep as string
      openPrice: Number(priceObject.Open),   // Convert to number
      highPrice: Number(priceObject.High),   // Convert to number
      lowPrice: Number(priceObject.Low),     // Convert to number
      closePrice: Number(priceObject.Close)  // Convert to number
    };
  }
  // Objects with inconsistent field count are SKIPPED
}
```

## Error Conditions

### Data Will Be Skipped If:
- JSON parsing fails on outer array
- JSON parsing fails on individual element
- Field count doesn't match first data element
- Required fields are missing

### Data Will Cause Errors If:
- Date string cannot be parsed by JavaScript Date constructor
- Non-numeric values in Open/High/Low/Close fields
- Outer container is not an array

## Testing

### Mock Data Location
- **File:** `src/data/mockApiData.json`
- **Purpose:** Reference implementation and testing fallback
- **Format:** Identical to expected API response

### Validation Checklist
- [ ] Response is valid JSON array
- [ ] Each element is a valid JSON string  
- [ ] All elements contain actual price data (no header)
- [ ] All data elements have required fields
- [ ] Date format is MM/dd/yyyy
- [ ] Price fields are numeric
- [ ] Parser produces expected Price[] output

## Integration Notes

### Frontend Integration
- **Service:** `ApiService.getStockData(symbol)`
- **Parser:** `ApiService.convertRawDataToList()`
- **Output:** `Price[]` interface from `src/types/index.ts`

### Type Definition
```typescript
interface Price {
  dateTime: string;    // Original date string
  openPrice: number;   // Converted open price
  highPrice: number;   // Converted high price  
  lowPrice: number;    // Converted low price
  closePrice: number;  // Converted close price
}
```

## Maintenance

When modifying this format:
1. **Update Parser:** Modify `convertRawDataToList()` method
2. **Update Types:** Modify `Price` interface if needed
3. **Update Docs:** Update this file and README.md
4. **Update Mocks:** Update `mockApiData.json`
5. **Test:** Verify with real API data
6. **Deploy:** Coordinate frontend and backend updates

---

**Last Updated:** April 11, 2026  
**Related Files:**
- `src/services/ApiService.ts` - Main parser implementation
- `src/types/index.ts` - Type definitions
- `src/data/mockApiData.json` - Reference mock data
- `README.md` - User-facing documentation