import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  Role,
  Bed,
  Room,
  Tenant,
  Bill,
  Complaint,
  ComplaintStatus,
  MealDay,
  OwnerSettings,
  PaymentMethod,
} from '../types';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  isLoggedIn: boolean;
  login: (phone: string, role: Role) => void;
  logout: () => void;
  ownerSettings: OwnerSettings;
  updateOwnerSettings: (settings: Partial<OwnerSettings>) => void;
  tenants: Tenant[];
  rooms: Room[];
  beds: Bed[];
  bills: Bill[];
  complaints: Complaint[];
  meals: MealDay[];
  currentTenant: Tenant;

  // Actions
  submitUPIPayment: (billId: string, utrNumber: string) => void;
  requestCashPayment: (billId: string) => void;
  approvePayment: (billId: string, method: PaymentMethod) => void;
  rejectPayment: (billId: string) => void;
  addTenant: (newTenant: Omit<Tenant, 'id'>, customFirstMonthRent?: number) => void;
  shiftTenantRoom: (tenantId: string, targetBedLabel: string) => void;
  settleTenantExit: (
    tenantId: string,
    deductions: { unpaidRent: number; unpaidElectricity: number; damages: number; remarks: string }
  ) => { netRefund: number; settlementId: string };
  updateRoomMeter: (roomNumber: string, currentReading: number) => void;
  batchSendElectricityBills: () => void;
  addComplaint: (category: Complaint['category'], title: string, description: string) => void;
  updateComplaintStatus: (complaintId: string, status: ComplaintStatus) => void;
}

// Initial Mock Rooms and Beds (40 beds across 3 floors)
const initialBeds: Bed[] = [
  // Floor 1
  { id: 'b1', bedLabel: '101-A', roomNumber: '101', status: 'occupied', rentAmount: 8500, tenantName: 'Aman Verma' },
  { id: 'b2', bedLabel: '101-B', roomNumber: '101', status: 'occupied', rentAmount: 8500, tenantName: 'Saurabh Roy' },
  { id: 'b3', bedLabel: '102-A', roomNumber: '102', status: 'occupied', rentAmount: 8500, tenantName: 'Rahul Sharma' },
  { id: 'b4', bedLabel: '102-B', roomNumber: '102', status: 'occupied', rentAmount: 8500, tenantName: 'Praveen Das' },
  { id: 'b5', bedLabel: '103-A', roomNumber: '103', status: 'occupied', rentAmount: 9000, tenantName: 'Kunal Sen' },
  { id: 'b6', bedLabel: '103-B', roomNumber: '103', status: 'vacant', rentAmount: 9000 }, // Vacant Bed 1
  { id: 'b7', bedLabel: '104-A', roomNumber: '104', status: 'occupied', rentAmount: 7500, tenantName: 'Vikas Dubey' },
  { id: 'b8', bedLabel: '104-B', roomNumber: '104', status: 'occupied', rentAmount: 7500, tenantName: 'Pankaj Lal' },
  { id: 'b9', bedLabel: '105-A', roomNumber: '105', status: 'occupied', rentAmount: 8000, tenantName: 'Rohan Mehra' },
  { id: 'b10', bedLabel: '105-B', roomNumber: '105', status: 'occupied', rentAmount: 8000, tenantName: 'Sahil Kapoor' },
  { id: 'b11', bedLabel: '106-A', roomNumber: '106', status: 'occupied', rentAmount: 8500, tenantName: 'Tarun Rao' },
  { id: 'b12', bedLabel: '106-B', roomNumber: '106', status: 'occupied', rentAmount: 8500, tenantName: 'Gaurav Gill' },
  { id: 'b13', bedLabel: '107-A', roomNumber: '107', status: 'vacant', rentAmount: 9000 }, // Vacant Bed 2
  { id: 'b14', bedLabel: '107-B', roomNumber: '107', status: 'occupied', rentAmount: 9000, tenantName: 'Deepak Joshi' },
  { id: 'b15', bedLabel: '108-A', roomNumber: '108', status: 'occupied', rentAmount: 8500, tenantName: 'Vikram Tiwari' },
  { id: 'b16', bedLabel: '108-B', roomNumber: '108', status: 'occupied', rentAmount: 8500, tenantName: 'Karan Shah' },

  // Floor 2
  { id: 'b17', bedLabel: '201-A', roomNumber: '201', status: 'occupied', rentAmount: 8500, tenantName: 'Harish Nair' },
  { id: 'b18', bedLabel: '201-B', roomNumber: '201', status: 'occupied', rentAmount: 8500, tenantName: 'Dev Patel' },
  { id: 'b19', bedLabel: '202-A', roomNumber: '202', status: 'notice', rentAmount: 8500, tenantName: 'Arjun Singhania', noticeEndDate: '2026-12-05' }, // On Notice 1
  { id: 'b20', bedLabel: '202-B', roomNumber: '202', status: 'occupied', rentAmount: 8500, tenantName: 'Ravi Teja' },
  { id: 'b21', bedLabel: '203-A', roomNumber: '203', status: 'occupied', rentAmount: 8500, tenantName: 'Manish Kumar' },
  { id: 'b22', bedLabel: '203-B', roomNumber: '203', status: 'occupied', rentAmount: 8500, tenantName: 'Rohit Sharma' }, // Active Demo Tenant!
  { id: 'b23', bedLabel: '204-A', roomNumber: '204', status: 'occupied', rentAmount: 8000, tenantName: 'Neha Patel' },
  { id: 'b24', bedLabel: '204-B', roomNumber: '204', status: 'occupied', rentAmount: 8000, tenantName: 'Priya Nambiar' },
  { id: 'b25', bedLabel: '205-A', roomNumber: '205', status: 'occupied', rentAmount: 8500, tenantName: 'Shubham Goel' },
  { id: 'b26', bedLabel: '205-B', roomNumber: '205', status: 'occupied', rentAmount: 8500, tenantName: 'Akash Mishra' },
  { id: 'b27', bedLabel: '206-A', roomNumber: '206', status: 'occupied', rentAmount: 8500, tenantName: 'Tanmay Bhatt' },
  { id: 'b28', bedLabel: '206-B', roomNumber: '206', status: 'occupied', rentAmount: 8500, tenantName: 'Nitin Gadkari' },
  { id: 'b29', bedLabel: '207-A', roomNumber: '207', status: 'occupied', rentAmount: 8000, tenantName: 'Ankit Gupta' },
  { id: 'b30', bedLabel: '207-B', roomNumber: '207', status: 'occupied', rentAmount: 8000, tenantName: 'Varun Dhawan' },
  { id: 'b31', bedLabel: '208-A', roomNumber: '208', status: 'occupied', rentAmount: 8500, tenantName: 'Mohit Suri' },
  { id: 'b32', bedLabel: '208-B', roomNumber: '208', status: 'occupied', rentAmount: 8500, tenantName: 'Prateek Kuhad' },

  // Floor 3
  { id: 'b33', bedLabel: '301-A', roomNumber: '301', status: 'occupied', rentAmount: 9000, tenantName: 'Amit Kumar' },
  { id: 'b34', bedLabel: '301-B', roomNumber: '301', status: 'occupied', rentAmount: 9000, tenantName: 'Chirag Sethi' },
  { id: 'b35', bedLabel: '302-A', roomNumber: '302', status: 'occupied', rentAmount: 7000, tenantName: 'Sameer Khan' },
  { id: 'b36', bedLabel: '302-B', roomNumber: '302', status: 'occupied', rentAmount: 7000, tenantName: 'Aditya Roy' },
  { id: 'b37', bedLabel: '303-A', roomNumber: '303', status: 'occupied', rentAmount: 9000, tenantName: 'Yashwardhan' },
  { id: 'b38', bedLabel: '303-B', roomNumber: '303', status: 'occupied', rentAmount: 9000, tenantName: 'Raghav Chadha' },
  { id: 'b39', bedLabel: '304-A', roomNumber: '304', status: 'occupied', rentAmount: 7000, tenantName: 'Farhan Akhtar' },
  { id: 'b40', bedLabel: '304-B', roomNumber: '304', status: 'occupied', rentAmount: 7000, tenantName: 'Sanjay Dutt' },
];

const initialRooms: Room[] = [
  {
    roomNumber: '101',
    floor: 1,
    electricityType: 'metered',
    previousReading: 3912,
    currentReading: 4106,
    ratePerUnit: 9,
    beds: initialBeds.filter((b) => b.roomNumber === '101'),
  },
  {
    roomNumber: '102',
    floor: 1,
    electricityType: 'metered',
    previousReading: 5240,
    currentReading: 5402,
    ratePerUnit: 9,
    beds: initialBeds.filter((b) => b.roomNumber === '102'),
  },
  {
    roomNumber: '203',
    floor: 2,
    electricityType: 'metered',
    previousReading: 4186,
    currentReading: 4400,
    ratePerUnit: 9,
    beds: initialBeds.filter((b) => b.roomNumber === '203'),
  },
  {
    roomNumber: '204',
    floor: 2,
    electricityType: 'metered',
    previousReading: 2950,
    currentReading: 3121,
    ratePerUnit: 9,
    beds: initialBeds.filter((b) => b.roomNumber === '204'),
  },
  {
    roomNumber: '301',
    floor: 3,
    electricityType: 'metered',
    previousReading: 6005,
    currentReading: 6180,
    ratePerUnit: 9,
    beds: initialBeds.filter((b) => b.roomNumber === '301'),
  },
  {
    roomNumber: '302',
    floor: 3,
    electricityType: 'included', // Electricity included in flat rent!
    previousReading: 0,
    currentReading: 0,
    ratePerUnit: 0,
    beds: initialBeds.filter((b) => b.roomNumber === '302'),
  },
];

const initialTenants: Tenant[] = [
  {
    id: 't-demo',
    name: 'Rohit Sharma',
    phone: '+91 98765 43210',
    roomNumber: '203',
    bedLabel: '203-B',
    joinDate: '2026-07-01',
    monthlyRent: 8500,
    depositAmount: 15000,
    electricityType: 'metered',
    kyc: { idProof: true, photo: true, agreement: true, policeVerification: true },
  },
  {
    id: 't-rahul',
    name: 'Rahul Sharma',
    phone: '+91 98111 22334',
    roomNumber: '102',
    bedLabel: '102-A',
    joinDate: '2026-06-15',
    monthlyRent: 8500,
    depositAmount: 15000,
    electricityType: 'metered',
    kyc: { idProof: true, photo: true, agreement: true, policeVerification: true },
  },
  {
    id: 't-neha',
    name: 'Neha Patel',
    phone: '+91 98222 33445',
    roomNumber: '204',
    bedLabel: '204-A',
    joinDate: '2026-08-01',
    monthlyRent: 8000,
    depositAmount: 16000,
    electricityType: 'metered',
    kyc: { idProof: true, photo: true, agreement: true, policeVerification: false },
  },
  {
    id: 't-amit',
    name: 'Amit Kumar',
    phone: '+91 98333 44556',
    roomNumber: '301',
    bedLabel: '301-A',
    joinDate: '2026-05-10',
    monthlyRent: 9000,
    depositAmount: 18000,
    electricityType: 'metered',
    kyc: { idProof: true, photo: true, agreement: true, policeVerification: true },
  },
  {
    id: 't-vikram',
    name: 'Vikram Tiwari',
    phone: '+91 98444 55667',
    roomNumber: '108',
    bedLabel: '108-A',
    joinDate: '2026-09-01',
    monthlyRent: 8500,
    depositAmount: 15000,
    electricityType: 'metered',
    kyc: { idProof: true, photo: true, agreement: false, policeVerification: false },
  },
  {
    id: 't-sameer',
    name: 'Sameer Khan',
    phone: '+91 98555 66778',
    roomNumber: '302',
    bedLabel: '302-A',
    joinDate: '2026-10-01',
    monthlyRent: 7000,
    depositAmount: 14000,
    electricityType: 'included', // Free / Included electricity
    kyc: { idProof: true, photo: true, agreement: true, policeVerification: true },
  },
];

const initialBills: Bill[] = [
  {
    id: 'bill-demo',
    tenantId: 't-demo',
    tenantName: 'Rohit Sharma',
    roomNumber: '203',
    bedLabel: '203-B',
    month: 'November 2026',
    dueDate: '2026-11-05',
    rentAmount: 8500,
    electricityType: 'metered',
    electricityUnits: 214, // 214 units @ ₹9 = ₹1926 / 2 roommates = ₹963
    electricityAmount: 963,
    totalAmount: 9463,
    status: 'unpaid',
  },
  {
    id: 'bill-102',
    tenantId: 't-rahul',
    tenantName: 'Rahul Sharma',
    roomNumber: '102',
    bedLabel: '102-A',
    month: 'November 2026',
    dueDate: '2026-11-05',
    rentAmount: 8500,
    electricityType: 'metered',
    electricityUnits: 162,
    electricityAmount: 729,
    totalAmount: 9229,
    status: 'unpaid',
    daysLate: 2,
  },
  {
    id: 'bill-204',
    tenantId: 't-neha',
    tenantName: 'Neha Patel',
    roomNumber: '204',
    bedLabel: '204-A',
    month: 'November 2026',
    dueDate: '2026-11-05',
    rentAmount: 8000,
    electricityType: 'metered',
    electricityUnits: 171,
    electricityAmount: 769,
    totalAmount: 8769,
    status: 'unpaid',
    daysLate: 2,
  },
  {
    id: 'bill-301',
    tenantId: 't-amit',
    tenantName: 'Amit Kumar',
    roomNumber: '301',
    bedLabel: '301-A',
    month: 'November 2026',
    dueDate: '2026-11-05',
    rentAmount: 9000,
    electricityType: 'metered',
    electricityUnits: 175,
    electricityAmount: 787,
    totalAmount: 9787,
    status: 'unpaid',
    daysLate: 4,
  },
  {
    id: 'bill-108',
    tenantId: 't-vikram',
    tenantName: 'Vikram Tiwari',
    roomNumber: '108',
    bedLabel: '108-A',
    month: 'November 2026',
    dueDate: '2026-11-05',
    rentAmount: 8500,
    electricityType: 'metered',
    electricityUnits: 180,
    electricityAmount: 810,
    totalAmount: 9310,
    status: 'unpaid',
    daysLate: 3,
  },
  {
    id: 'bill-past-oct',
    tenantId: 't-demo',
    tenantName: 'Rohit Sharma',
    roomNumber: '203',
    bedLabel: '203-B',
    month: 'October 2026',
    dueDate: '2026-10-05',
    rentAmount: 8500,
    electricityType: 'metered',
    electricityUnits: 190,
    electricityAmount: 855,
    totalAmount: 9355,
    status: 'paid',
    paymentMethod: 'upi_direct',
    utrNumber: '429817654123',
    paidDate: '2026-10-03',
  },
];

const initialComplaints: Complaint[] = [
  {
    id: 'c1',
    tenantId: 't-demo',
    tenantName: 'Rohit Sharma',
    roomNumber: '203',
    category: 'AC',
    title: 'AC cooling is low',
    description: 'AC is running but not cooling properly on hot afternoons. Filter might need service.',
    status: 'resolved',
    createdAt: '2026-11-20 09:15',
    viewedAt: '2026-11-20 10:30',
    resolvedAt: '2026-11-20 16:45',
  },
  {
    id: 'c2',
    tenantId: 't-105',
    tenantName: 'Rohan Mehra',
    roomNumber: '105',
    category: 'WiFi',
    title: 'WiFi speed dropping frequently',
    description: '1st floor router keeps disconnecting during work calls.',
    status: 'viewed',
    createdAt: '2026-11-24 14:00',
    viewedAt: '2026-11-24 15:10',
  },
  {
    id: 'c3',
    tenantId: 't-amit',
    tenantName: 'Amit Kumar',
    roomNumber: '301',
    category: 'Water',
    title: 'Geyser not heating',
    description: 'Water stays cold after keeping geyser switch on for 20 mins.',
    status: 'submitted',
    createdAt: '2026-11-25 08:30',
  },
  {
    id: 'c4',
    tenantId: 't-204',
    tenantName: 'Neha Patel',
    roomNumber: '204',
    category: 'Cleaning',
    title: 'Room cleaning missed',
    description: 'Housekeeping missed 2nd floor room 204 yesterday.',
    status: 'resolved',
    createdAt: '2026-11-22 11:00',
    viewedAt: '2026-11-22 11:30',
    resolvedAt: '2026-11-22 13:00',
  },
  {
    id: 'c5',
    tenantId: 't-103',
    tenantName: 'Kunal Sen',
    roomNumber: '103',
    category: 'Lock',
    title: 'Balcony door latch stuck',
    description: 'Latch is stiff and hard to close tightly.',
    status: 'submitted',
    createdAt: '2026-11-25 18:20',
  },
];

const initialMeals: MealDay[] = [
  {
    day: 'Monday',
    dateStr: 'Nov 24',
    breakfast: 'Poha, Boiled Eggs, Tea / Coffee',
    lunch: 'Rajma Chawal, Roti, Seasonal Mix Veg, Salad',
    dinner: 'Dal Makhani, Jeera Rice, Phulka, Gulab Jamun',
    timings: { breakfast: '7:30 - 9:30 AM', lunch: '12:30 - 2:30 PM', dinner: '8:00 - 10:00 PM' },
  },
  {
    day: 'Tuesday',
    dateStr: 'Nov 25',
    breakfast: 'Idli, Sambar, Coconut Chutney, Filter Coffee',
    lunch: 'Kadhi Pakoda, Steam Rice, Aloo Jeera, Curd',
    dinner: 'Shahi Paneer, Butter Roti, Dal Tadka, Kheer',
    timings: { breakfast: '7:30 - 9:30 AM', lunch: '12:30 - 2:30 PM', dinner: '8:00 - 10:00 PM' },
  },
  {
    day: 'Wednesday',
    dateStr: 'Nov 26',
    breakfast: 'Aloo Paratha, Fresh Curd, Pickle, Chai',
    lunch: 'Chole Bhature / Rice, Boondi Raita, Onion Salad',
    dinner: 'Egg Curry / Paneer Bhurji, Tawa Roti, Dal Fry',
    timings: { breakfast: '7:30 - 9:30 AM', lunch: '12:30 - 2:30 PM', dinner: '8:00 - 10:00 PM' },
  },
  {
    day: 'Thursday',
    dateStr: 'Nov 27',
    breakfast: 'Upma, Medu Vada, Sambar, Chai',
    lunch: 'Dal Palak, Matar Paneer, Steamed Rice, Roti',
    dinner: 'Dum Aloo Kashmiri, Rice, Dal Tadka, Halwa',
    timings: { breakfast: '7:30 - 9:30 AM', lunch: '12:30 - 2:30 PM', dinner: '8:00 - 10:00 PM' },
  },
  {
    day: 'Friday',
    dateStr: 'Nov 28',
    breakfast: 'Masala Dosa, Chutney, Sambar, Chai',
    lunch: 'Mix Veg Pulao, Paneer Curry, Boondi Raita',
    dinner: 'Special Chicken Curry / Paneer Lababdar, Naan, Rice',
    timings: { breakfast: '7:30 - 9:30 AM', lunch: '12:30 - 2:30 PM', dinner: '8:00 - 10:00 PM' },
  },
  {
    day: 'Saturday',
    dateStr: 'Nov 29',
    breakfast: 'Puri Bhaji, Halwa, Masala Chai',
    lunch: 'Kashmiri Rajma, Rice, Bhindi Do Pyaza, Salad',
    dinner: 'Veg Biryani / Hyderabadi Biryani, Mirchi Ka Salan',
    timings: { breakfast: '8:00 - 10:00 AM', lunch: '1:00 - 3:00 PM', dinner: '8:30 - 10:30 PM' },
  },
  {
    day: 'Sunday',
    dateStr: 'Nov 30',
    breakfast: 'Chole Kulche, Sweet Lassi, Fruits',
    lunch: 'Special Sunday Feast: Paneer Butter Masala, Dal, Jeera Rice',
    dinner: 'Light Khichdi / Roti Sabzi, Papad, Curd',
    timings: { breakfast: '8:30 - 10:30 AM', lunch: '1:00 - 3:30 PM', dinner: '8:30 - 10:30 PM' },
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('tenant'); // Can easily switch in top bar!
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const [ownerSettings, setOwnerSettings] = useState<OwnerSettings>({
    pgName: 'Aapka PG & Co-Living',
    ownerName: 'Vikram Malhotra',
    upiId: 'aapkapg@okhdfcbank', // Direct Owner VPA
    phone: '+91 98765 00000',
    address: 'Plot 42, Knowledge Park 3, Sector 62',
    ratePerUnit: 9,
  });

  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [beds, setBeds] = useState<Bed[]>(initialBeds);
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [meals] = useState<MealDay[]>(initialMeals);

  // Active tenant for Tenant Mode
  const currentTenant = useMemo(() => {
    return tenants.find((t) => t.id === 't-demo') || tenants[0];
  }, [tenants]);

  const login = (phone: string, chosenRole: Role) => {
    setRole(chosenRole);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const updateOwnerSettings = (settings: Partial<OwnerSettings>) => {
    setOwnerSettings((prev) => ({ ...prev, ...settings }));
  };

  // Direct UPI Payment: Tenant enters 12-digit UTR
  const submitUPIPayment = (billId: string, utrNumber: string) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          return {
            ...b,
            status: 'verification_pending',
            paymentMethod: 'upi_direct',
            utrNumber,
          };
        }
        return b;
      })
    );
  };

  // Direct Cash Payment: Tenant requests cash confirmation
  const requestCashPayment = (billId: string) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          return {
            ...b,
            status: 'verification_pending',
            paymentMethod: 'cash',
          };
        }
        return b;
      })
    );
  };

  // Owner/Manager 1-Tap Approves payment
  const approvePayment = (billId: string, method: PaymentMethod) => {
    const today = new Date().toISOString().split('T')[0];
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          return {
            ...b,
            status: 'paid',
            paymentMethod: method,
            paidDate: today,
            daysLate: 0,
          };
        }
        return b;
      })
    );
  };

  // Reject invalid payment
  const rejectPayment = (billId: string) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          return {
            ...b,
            status: 'unpaid',
            utrNumber: undefined,
          };
        }
        return b;
      })
    );
  };

  // Add Tenant (Onboarding with Pro-rata rent support)
  const addTenant = (newTenantData: Omit<Tenant, 'id'>, customFirstMonthRent?: number) => {
    const newId = `t-${Date.now()}`;
    const newTenant: Tenant = {
      ...newTenantData,
      id: newId,
    };

    setTenants((prev) => [...prev, newTenant]);

    // Update Bed status to 'occupied'
    setBeds((prev) =>
      prev.map((b) => {
        if (b.bedLabel === newTenantData.bedLabel) {
          return {
            ...b,
            status: 'occupied',
            tenantId: newId,
            tenantName: newTenantData.name,
          };
        }
        return b;
      })
    );

    // Generate First Bill (with pro-rata rent if applicable)
    const rentToCharge = customFirstMonthRent ?? newTenantData.monthlyRent;
    const firstBill: Bill = {
      id: `bill-${Date.now()}`,
      tenantId: newId,
      tenantName: newTenantData.name,
      roomNumber: newTenantData.roomNumber,
      bedLabel: newTenantData.bedLabel,
      month: 'November 2026',
      dueDate: new Date().toISOString().split('T')[0],
      rentAmount: rentToCharge,
      electricityType: newTenantData.electricityType,
      electricityUnits: 0,
      electricityAmount: 0,
      totalAmount: rentToCharge,
      status: 'unpaid',
    };

    setBills((prev) => [firstBill, ...prev]);
  };

  // Shift Tenant Room (preserves documents and history)
  const shiftTenantRoom = (tenantId: string, targetBedLabel: string) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    if (!tenant) return;

    const oldBedLabel = tenant.bedLabel;
    const targetRoomNumber = targetBedLabel.split('-')[0];
    const targetBed = beds.find((b) => b.bedLabel === targetBedLabel);
    const newRent = targetBed ? targetBed.rentAmount : tenant.monthlyRent;

    // 1. Vacate old bed
    setBeds((prev) =>
      prev.map((b) => {
        if (b.bedLabel === oldBedLabel) {
          return { ...b, status: 'vacant', tenantId: undefined, tenantName: undefined };
        }
        if (b.bedLabel === targetBedLabel) {
          return { ...b, status: 'occupied', tenantId: tenant.id, tenantName: tenant.name };
        }
        return b;
      })
    );

    // 2. Update tenant profile
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          return {
            ...t,
            bedLabel: targetBedLabel,
            roomNumber: targetRoomNumber,
            monthlyRent: newRent,
          };
        }
        return t;
      })
    );
  };

  // Settle Tenant Exit & Refund Security Deposit
  const settleTenantExit = (
    tenantId: string,
    deductions: { unpaidRent: number; unpaidElectricity: number; damages: number; remarks: string }
  ) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    const deposit = tenant ? tenant.depositAmount : 0;
    const totalDeductions = deductions.unpaidRent + deductions.unpaidElectricity + deductions.damages;
    const netRefund = Math.max(0, deposit - totalDeductions);
    const settlementId = `SETTLE-${Date.now().toString().slice(-6)}`;

    if (tenant) {
      // 1. Free up bed
      setBeds((prev) =>
        prev.map((b) => {
          if (b.bedLabel === tenant.bedLabel) {
            return { ...b, status: 'vacant', tenantId: undefined, tenantName: undefined, noticeEndDate: undefined };
          }
          return b;
        })
      );

      // 2. Remove / Archive tenant
      setTenants((prev) => prev.filter((t) => t.id !== tenantId));

      // 3. Close open bills
      setBills((prev) => prev.filter((b) => b.tenantId !== tenantId));
    }

    return { netRefund, settlementId };
  };

  // Update room electricity reading
  const updateRoomMeter = (roomNumber: string, currentReading: number) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.roomNumber === roomNumber) {
          return { ...r, currentReading };
        }
        return r;
      })
    );
  };

  // Batch send electricity bills
  const batchSendElectricityBills = () => {
    // Recalculate and update bills based on room readings
    rooms.forEach((room) => {
      if (room.electricityType === 'included') return;

      const units = Math.max(0, room.currentReading - room.previousReading);
      const totalRoomCost = units * room.ratePerUnit;
      const roomTenants = tenants.filter((t) => t.roomNumber === room.roomNumber);
      const sharePerTenant = roomTenants.length > 0 ? Math.round(totalRoomCost / roomTenants.length) : totalRoomCost;

      setBills((prev) =>
        prev.map((bill) => {
          if (bill.roomNumber === room.roomNumber && bill.status === 'unpaid') {
            return {
              ...bill,
              electricityUnits: units,
              electricityAmount: sharePerTenant,
              totalAmount: bill.rentAmount + sharePerTenant,
            };
          }
          return bill;
        })
      );
    });
  };

  // Add Complaint
  const addComplaint = (category: Complaint['category'], title: string, description: string) => {
    const newComplaint: Complaint = {
      id: `c-${Date.now()}`,
      tenantId: currentTenant.id,
      tenantName: currentTenant.name,
      roomNumber: currentTenant.roomNumber,
      category,
      title,
      description,
      status: 'submitted',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setComplaints((prev) => [newComplaint, ...prev]);
  };

  // Update Complaint Status (Manager / Owner)
  const updateComplaintStatus = (complaintId: string, status: ComplaintStatus) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status,
            viewedAt: status === 'viewed' || status === 'resolved' ? c.viewedAt || timestamp : undefined,
            resolvedAt: status === 'resolved' ? timestamp : undefined,
          };
        }
        return c;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        isLoggedIn,
        login,
        logout,
        ownerSettings,
        updateOwnerSettings,
        tenants,
        rooms,
        beds,
        bills,
        complaints,
        meals,
        currentTenant,
        submitUPIPayment,
        requestCashPayment,
        approvePayment,
        rejectPayment,
        addTenant,
        shiftTenantRoom,
        settleTenantExit,
        updateRoomMeter,
        batchSendElectricityBills,
        addComplaint,
        updateComplaintStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
