import promptSync from 'prompt-sync';     
import mongoose from 'mongoose';            

const prompt = promptSync();                
const mongoURI = 'mongodb://127.0.0.1:27017/yourDatabase'; 

mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, 
    socketTimeoutMS: 45000, 
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB:', err));


const doctorSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, 
    password: { type: String, required: true },              
    firstName: String,
    lastName: String,
    email: String,
    contactNumber: String
});

const Doctor = mongoose.model('Doctor', doctorSchema);

async function displayRegisteredDoctors() {
    try {
        const doctors = await Doctor.find();
        if (doctors.length === 0) {
            console.log('No doctors registered yet.');
        } else {
            console.log('Registered doctors:');
            doctors.forEach((doctor, index) => {
                console.log(`${index + 1}. Username: ${doctor.username}, Full Name: ${doctor.firstName} ${doctor.lastName}, Email: ${doctor.email}, Contact Number: ${doctor.contactNumber}`);
            });
        }
    } catch (error) {
        console.error('Error retrieving doctors:', error);
    }
}

async function registerNewDoctor() {
    const newUsername = prompt('Enter new doctor username: ');
    if (!newUsername) {
        console.log('Username cannot be empty.');
        return;
    }
    const newPassword = prompt('Enter new doctor password: ');
    if (!newPassword) {
        console.log('Password cannot be empty.');
        return;
    }
    const firstName = prompt('Enter doctor first name: ');
    const lastName = prompt('Enter doctor last name: ');
    const email = prompt('Enter doctor email: ');
    const contactNumber = prompt('Enter doctor contact number: ');

    

    try {
        const doctorExists = await Doctor.findOne({ username: newUsername }).exec();

        if (doctorExists) {
            console.log('Doctor username already exists. Please choose a different username.');
        } else {
            const newDoctor = new Doctor({
                username: newUsername,
                password: newPassword,
                firstName: firstName,
                lastName: lastName,
                email: email,
                contactNumber: contactNumber
            });
            await newDoctor.save(); 
            console.log('New doctor registered successfully!');
        }
    } catch (error) {
        console.error('Error registering new doctor:', error);
    }
}

async function doctorLogin() {
    const username = prompt('Enter username: ');
    const password = prompt('Enter password: ');

    try {
        const doctor = await Doctor.findOne({ username: username, password: password });
        if (doctor) {
            console.log(`Doctor Login successful!`);
            await doctorMenu(doctor);
        } else {
            console.log('Doctor Login failed! Invalid username or password.');
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
}

async function doctorMenu(doctor) {
    while (true) {
        console.log('\n1. Add Patient Details (Disabled)');
        console.log('2. View Patient Details (Disabled)');
        console.log('3. Logout');

        const option = prompt('Choose an option: ');

        if (option === '1') {
            console.log('Adding patient details is disabled.');
        } else if (option === '2') {
            console.log('Viewing patient details is disabled.');
        } else if (option === '3') {
            console.log('Logging out...');
            break;
        } else {
            console.log('Invalid option. Please try again.');
        }
    }
}

async function adminLogin() {
    const username = prompt('Enter admin username: ');
    const password = prompt('Enter admin password: ');

    const correctAdminUsername = "admin";
    const correctAdminPassword = "admin@123";

    if (username === correctAdminUsername && password === correctAdminPassword) {
        console.log('Admin Login successful! Welcome to the system.');
    } else {
        console.log('Admin Login failed! Invalid username or password.');
    }
}

async function main() {
    while (true) {
        console.log('\nPress 1 for Admin, 2 for Doctor, or 3 to Register a New Doctor (Press Q to quit): ');
        const id = prompt('Your choice: ');

        if (id === '1') {
            await adminLogin();
        } else if (id === '2') {
            await doctorLogin();
        } else if (id === '3') {
            await registerNewDoctor();
        } else if (id.toLowerCase() === 'q') {
            console.log('Exiting system. Goodbye!');
            mongoose.connection.close(); 
            break;
        } else {
            console.log('Invalid selection! Please press 1 for Admin, 2 for Doctor, or 3 to Register a New Doctor.');
        }
    }
}

main();
