const fs = require('fs');
const path = require('path');

const capitals = {
    'andaman-nicobar': 'Port Blair',
    'andhra-pradesh': 'Amaravati',
    'arunachal-pradesh': 'Itanagar',
    'assam': 'Dispur',
    'bihar': 'Patna',
    'chandigarh': 'Chandigarh',
    'chhattisgarh': 'Raipur',
    'dadar-nagar-haveli': 'Silvassa',
    'daman-diu': 'Daman',
    'delhi': 'New Delhi',
    'goa': 'Panaji',
    'gujarat': 'Gandhinagar',
    'haryana': 'Chandigarh',
    'himachal-pradesh': 'Shimla',
    'jammu-kashmir': 'Srinagar',
    'jharkhand': 'Ranchi',
    'karnataka': 'Bengaluru',
    'kerala': 'Thiruvananthapuram',
    'lakshadweep': 'Kavaratti',
    'madhya-pradesh': 'Bhopal',
    'maharashtra': 'Mumbai',
    'manipur': 'Imphal',
    'meghalaya': 'Shillong',
    'mizoram': 'Aizawl',
    'nagaland': 'Kohima',
    'orissa': 'Bhubaneswar',
    'puducherry': 'Puducherry',
    'punjab': 'Chandigarh',
    'rajasthan': 'Jaipur',
    'sikkim': 'Gangtok',
    'tamil-nadu': 'Chennai',
    'telangana': 'Hyderabad',
    'tripura': 'Agartala',
    'uttar-pradesh': 'Lucknow',
    'uttarkhand': 'Dehradun',
    'west-bengal': 'Kolkata',
    'ladakh': 'Leh'
};

const dataPath = path.join(__dirname, 'src', 'data', 'states.json');
const data = require(dataPath);

data.states.forEach(state => {
    if (capitals[state.id]) {
        if (!state.geography) state.geography = {};
        state.geography.capital = capitals[state.id];
    }
});

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log("Capitals successfully populated.");
