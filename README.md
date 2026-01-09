# Save The Date - Sonu & Gourav Wedding Website

A beautiful, interactive "Save The Date" website for the wedding of Sonu & Gourav on 26th March.

## Features

1. **Envelope Opening Animation**: Full-screen pastel green envelope with golden seal that opens to reveal the website
2. **Scratch to Reveal**: Interactive heart-shaped card with glitter effect that reveals the wedding date when scratched
3. **Floating Lanterns**: Decorative lanterns with parallax effect that create a 3D visual illusion
4. **Google Maps Integration**: Venue location with clickable map that opens in Google Maps
5. **Wedding Details**: Information about date, time, venue, and dress code
6. **Program Details**: Timeline of wedding events
7. **Cordial Invitation**: Beautiful invitation message
8. **Fully Responsive**: Optimized for both mobile and laptop devices

## File Structure

```
envolop/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── script.js           # JavaScript functionality
├── assets/             # Folder for background images (to be added)
└── README.md          # This file

```

## Setup Instructions

1. Place your background images in the `assets/` folder:
   - `bg1.jpg` - For section 1 (scratch to reveal)
   - `bg2.jpg` - For section 2 (venue location)
   - `bg3.jpg` - For section 3 (wedding details)
   - `bg4.jpg` - For section 4 (program details)
   - `bg5.jpg` - For section 5 (invitation)

2. Update the venue coordinates in `script.js`:
   - Find the `initializeMap()` function
   - Replace `venueLat` and `venueLng` with actual coordinates
   - Update `venueName` with the actual venue name

3. Open `index.html` in a web browser

## Customization

### Update Wedding Details
Edit the content in `index.html`:
- Couple names
- Wedding date
- Venue information
- Program details
- Invitation text

### Change Colors
Modify CSS variables in `styles.css`:
```css
:root {
    --pastel-green: #B8E6B8;
    --gold: #D4AF37;
    --dark-gold: #B8941F;
}
```

### Adjust Animations
Modify animation durations and effects in `styles.css` and `script.js`

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- The website uses placeholder images from Unsplash for demo purposes
- Replace these with your actual wedding photos
- The scratch functionality works on both desktop (mouse) and mobile (touch)
- Background images change as you scroll through sections

