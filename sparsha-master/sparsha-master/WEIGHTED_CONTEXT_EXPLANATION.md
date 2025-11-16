# Weighted Context System - Factor Priority

## Current Priority System

The skincare recommendation system uses a **weighted context approach** where each factor has a specific weight that determines its importance:

### Factor Weights (Priority Order)

1. **Skin Type: 40%** (HIGHEST PRIORITY - CRITICAL)
   - This is the BASE foundation
   - Determines the core product categories
   - Example: Oily skin needs oil-control products, dry skin needs hydration

2. **Weather: 30%** (SECOND PRIORITY - HIGH)
   - MODIFIES the base skin type routine
   - Higher priority than occupation
   - Example: Hot weather → lighter products, Cold weather → richer products

3. **Occupation: 20%** (THIRD PRIORITY - MEDIUM)
   - ADJUSTS the routine for lifestyle needs
   - Lower priority than weather
   - Example: Outdoor work → more SPF, Office work → blue light protection

4. **Age: 10%** (LOWEST PRIORITY - LOW)
   - Fine-tunes recommendations
   - Optional factor
   - Example: Younger → prevention focus, Older → anti-aging focus

## How It Works

### Step-by-Step Process:

1. **Start with Skin Type (40%)**
   - Base routine: "For oily skin, use oil-control cleanser, lightweight moisturizer..."

2. **Modify for Weather (30%)**
   - If hot weather: "Make products lighter, add SPF 50+..."
   - If cold weather: "Add hydration, use richer products..."

3. **Adjust for Occupation (20%)**
   - If outdoor work: "Add post-work cleansing, increase SPF..."
   - If office work: "Add eye care, blue light protection..."

4. **Fine-tune for Age (10%)**
   - If young: "Focus on prevention..."
   - If mature: "Add anti-aging ingredients..."

## Example: Priority in Action

**Scenario:** Oily Skin + Hot Weather (35°C) + Construction Worker + Age 25

1. **Base (Skin Type - 40%):** Oil-control cleanser, lightweight moisturizer, salicylic acid
2. **Weather Modification (30%):** Make even lighter (gel-based), SPF 50+ (high UV), mattifying products
3. **Occupation Adjustment (20%):** Pre-work cleanser, post-work double cleanse, antioxidant serum
4. **Age Fine-tuning (10%):** Prevention focus, establish good habits

**Result:** A unique routine that combines all factors, with weather having more influence than occupation.

## Why This Priority?

- **Skin Type (40%):** Most fundamental - determines what your skin actually needs
- **Weather (30%):** Environmental factors significantly impact skin daily
- **Occupation (20%):** Lifestyle factor that affects routine timing and specific needs
- **Age (10%):** Long-term factor, less immediate impact

## Can You Change the Weights?

Yes! The weights are defined in `_build_weighted_context()` method. You can adjust them based on your needs:

```python
"skin_type": {
    "weight": 40,  # Change this value
    "priority": "CRITICAL"
},
"weather": {
    "weight": 30,  # Change this value
    "priority": "HIGH"
},
"occupation": {
    "weight": 20,  # Change this value
    "priority": "MEDIUM"
},
"age": {
    "weight": 10,  # Change this value
    "priority": "LOW"
}
```

**Note:** The weights should add up to 100% for clarity, but the system works with any relative weights.

## Current Answer to Your Question

**Weather (30%) has HIGHER priority than Occupation (20%)**

This means:
- Weather conditions will have MORE influence on recommendations than occupation
- For example, hot weather will modify the routine more than an office job
- However, both factors are still important and work together

