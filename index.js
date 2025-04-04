document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const hamburger = document.querySelector('.hamburger');
  const navbar = document.querySelector('.navbar');
  const menu = document.querySelector('.menu');
  
  hamburger.addEventListener('click', function() {
    // Toggle menu active state
    navbar.classList.toggle('active');
    menu.classList.toggle('active');
    
    // Hamburger animation
    this.classList.toggle('active');
    
    // Prevent body scrolling when menu is open
    document.body.style.overflow = navbar.classList.contains('active') ? 'hidden' : 'auto';
  });
  
  // Close menu and smooth scroll when clicking on a link
  document.querySelectorAll('.menu a').forEach(link => {
    link.addEventListener('click', (e) => {
      // Close mobile menu if open
      navbar.classList.remove('active');
      menu.classList.remove('active');
      hamburger.classList.remove('active');
      document.body.style.overflow = 'auto';
      
      // Get the target section's ID from the href attribute
      const targetId = link.getAttribute('href');
      
      // Check if it's an internal link (starts with #)
      if (targetId.startsWith('#')) {
        e.preventDefault(); // Prevent default anchor behavior
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          // Scroll to the target section smoothly
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Update URL without jumping
          if (history.pushState) {
            history.pushState(null, null, targetId);
          } else {
            window.location.hash = targetId;
          }
        }
      }
    });
  });
});
document.addEventListener('DOMContentLoaded', function() {
  const API_URL = 'https://bootcamps-api-19sb.onrender.com/bootcamps'; // External API URL
  
  // DOM Elements
  const bootcampsGrid = document.getElementById('bootcampsGrid');
  const searchInput = document.getElementById('searchInput');
  const countryFilter = document.getElementById('countryFilter');
  const stateFilter = document.getElementById('stateFilter');
  const ratingFilter = document.getElementById('ratingFilter');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const addBootcampBtn = document.getElementById('addBootcampBtn');
  const modal = document.getElementById('addBootcampModal');
  const closeBtn = document.querySelector('.close');
  const bootcampForm = document.getElementById('bootcampForm');
  const formCountry = document.getElementById('country');
  const formState = document.getElementById('state');

  let bootcamps = [];
  let displayedCount = 6;

  // Initialize the page
  async function init() {
    await fetchBootcamps();
    renderBootcamps();
    setupEventListeners();
  }

  // Fetch bootcamps from the external API
  async function fetchBootcamps() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Failed to fetch bootcamps: ${response.status} ${response.statusText}`);
      bootcamps = await response.json();
      console.log('Bootcamps fetched:', bootcamps);
    } catch (error) {
      console.error('Error loading bootcamps:', error);
      alert('Failed to load bootcamps. Please ensure the server is running.');
      bootcamps = []; // Fallback to an empty array
    }
  }

  // Set up event listeners
  function setupEventListeners() {
    searchInput.addEventListener('input', filterBootcamps);
    countryFilter.addEventListener('change', updateStateFilter);
    stateFilter.addEventListener('change', filterBootcamps);
    ratingFilter.addEventListener('change', filterBootcamps);
    
    loadMoreBtn.addEventListener('click', function() {
      displayedCount += 6;
      renderBootcamps();
    });

    addBootcampBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', outsideClick);

    bootcampForm.addEventListener('submit', handleFormSubmit);
    formCountry.addEventListener('change', function() {
      updateFormStateOptions(this.value);
    });
  }

  // Render bootcamps to the grid
  function renderBootcamps(bootcampsToRender = bootcamps) {
    bootcampsGrid.innerHTML = '';
    
    const bootcampsToShow = bootcampsToRender.slice(0, displayedCount);
    
    if (bootcampsToShow.length === 0) {
      bootcampsGrid.innerHTML = '<p class="no-results">No bootcamps found matching your criteria.</p>';
      loadMoreBtn.style.display = 'none';
      return;
    }

    bootcampsToShow.forEach(bootcamp => {
      const card = document.createElement('div');
      card.className = 'bootcamp-card';
      card.onclick = () => window.open(bootcamp.website, '_blank');
      
      const ratingStars = '★'.repeat(bootcamp.rating) + '☆'.repeat(5 - bootcamp.rating);
      
      card.innerHTML = `
        <div class="card-header">
          <h3>${bootcamp.name}</h3>
          <div class="rating">${ratingStars}</div>
        </div>
        <div class="card-body">
          <p><strong>Location:</strong> ${bootcamp.state}, ${bootcamp.country}</p>
          <p>${bootcamp.description}</p>
        </div>
      `;
      
      bootcampsGrid.appendChild(card);
    });

    loadMoreBtn.style.display = bootcampsToRender.length > displayedCount ? 'block' : 'none';
  }

  // Filter bootcamps based on search and filter criteria
  function filterBootcamps() {
    const searchTerm = searchInput.value.toLowerCase();
    const country = countryFilter.value;
    const state = stateFilter.value;
    const rating = parseInt(ratingFilter.value);

    const filtered = bootcamps.filter(bootcamp => {
      return (
        (searchTerm === '' || 
         bootcamp.name.toLowerCase().includes(searchTerm) || 
         bootcamp.description.toLowerCase().includes(searchTerm)) &&
        (country === '' || bootcamp.country === country) &&
        (state === '' || bootcamp.state === state) &&
        (rating === 0 || bootcamp.rating >= rating)
      );
    });

    displayedCount = 6; // Reset displayed count when filtering
    renderBootcamps(filtered);
  }

  // Update state filter options based on selected country
  function updateStateFilter() {
    const country = this.value;
    stateFilter.style.display = country ? 'block' : 'none';
    
    if (country) {
      const states = getStatesForCountry(country);
      stateFilter.innerHTML = '<option value="">All States/Regions</option>' + 
        states.map(state => `<option value="${state}">${state}</option>`).join('');
    }
    
    filterBootcamps();
  }

  // Update form state options based on selected country
  function updateFormStateOptions(country) {
    formState.disabled = !country;
    
    if (country) {
      const states = getStatesForCountry(country);
      formState.innerHTML = '<option value="">Select State/Region</option>' + 
        states.map(state => `<option value="${state}">${state}</option>`).join('');
    }
  }

  // Get states for a given country
  function getStatesForCountry(country) {
    const statesByCountry = {
      'United States': ['California', 'New York', 'Texas', 'Florida', 'Washington'],
      'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
      'Canada': ['Ontario', 'Quebec', 'British Columbia', 'Alberta'],
      'Germany': ['Bavaria', 'Berlin', 'Hamburg', 'North Rhine-Westphalia'],
      'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru']
    };
    
    return statesByCountry[country] || [];
  }

  // Open the add bootcamp modal
  function openModal() {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  }

  // Close the modal
  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
    bootcampForm.reset();
  }

  // Close modal when clicking outside of it
  function outsideClick(e) {
    if (e.target === modal) {
      closeModal();
    }
  }

  // Handle form submission - save to external API
  async function handleFormSubmit(e) {
    e.preventDefault();
    
    const newBootcamp = {
      id: Date.now(), // Generate unique ID
      name: document.getElementById('bootcampName').value,
      country: formCountry.value,
      state: formState.value,
      rating: parseInt(document.getElementById('rating').value),
      description: document.getElementById('description').value,
      website: document.getElementById('website').value
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBootcamp)
      });

      if (!response.ok) throw new Error(`Failed to add bootcamp: ${response.status} ${response.statusText}`);
      
      const addedBootcamp = await response.json();
      console.log('Bootcamp added:', addedBootcamp);
      bootcamps.unshift(addedBootcamp);
      renderBootcamps();
      closeModal();
    } catch (error) {
      console.error('Error adding bootcamp:', error);
      alert('Failed to add bootcamp. Please check your server connection.');
    }
  }

  // Initialize the page
  init();
});
// Form submission handler
document.getElementById('signupForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  // Get form data
  const formData = {
      fullName: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      dob: document.getElementById('dob').value,
      gender: document.querySelector('input[name="gender"]:checked').value,
      password: document.getElementById('password').value
  };

  try {
      // Replace this URL with your actual JSON server endpoint for users
      const response = await fetch('https://bootcamps-api-19sb.onrender.com/User', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
      });

      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Success:', result);
      alert('Registration successful!');
      this.reset(); // Reset the form after successful submission
  } catch (error) {
      console.error('Error:', error);
      alert('Registration failed. Please try again.');
  }
});