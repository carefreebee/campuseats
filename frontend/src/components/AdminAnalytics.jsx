import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { red } from '@mui/material/colors';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';

import { useEffect, useState } from 'react';
import axios from "../utils/axiosConfig";




const ShopAnalytics = () => {
  return (
    <div className="p-4 items-center justify-center w-full h-full flex flex-col">
      <h2>Shop Analytics</h2>
      <p>Details about Shop analytics go heredsadasdsa.</p>
    </div>
  );
}

const DashersAnalytics = () => {
    const[currentDashers, setCurrentDashers] = useState([]);
    const[allDashers, setAllDashers] = useState([]);
    const [cancelledOrders, setCancelledOrders] = useState(0);
    const[completedOrders, setCompletedOrders] = useState(0);
    const [loading, setLoading] = useState(false);
    const[allOrders, setAllOrders] = useState([]);
    const [selectedYear,setSelectedYear] = useState(2024)
 

    const fetchDashers = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/dashers/pending-lists');
                const pendingDashersHold = response.data.pendingDashers;
                const currentDashersHold = response.data.nonPendingDashers;
                const pendingDashersData = await Promise.all(
                    pendingDashersHold.map(async (dasher) => {
                        const pendingDashersDataResponse = await axios.get(`/users/${dasher.id}`);
                        const pendingDashersData = pendingDashersDataResponse.data;
                        return { ...dasher, userData: pendingDashersData };
                    })
                );
                const currentDashersData = await Promise.all(
                    currentDashersHold.map(async (dasher) => {
                        const currentDashersDataResponse = await axios.get(`/users/${dasher.id}`);
                        const currentDashersData = currentDashersDataResponse.data;
                        return { ...dasher, userData: currentDashersData };
                    })
                );

                const realDashers = currentDashersData.filter((dasher) => dasher.status === "active" || dasher.status === "offline");

                setAllDashers(currentDashersData);
                setCurrentDashers(realDashers);
            } catch (error) {
                console.error('Error fetching dashers:', error.response.data.error);
            }finally{
                setLoading(false);
            }
        };

    const fetchOrders = async () => {
        setLoading(true);
        try{
            const response = await axios.get('/orders/completed-orders')
            const allOrders = response.data.completedOrders;
            setAllOrders(allOrders);
        
        const maonani = allOrders.filter(order => order.status === 'completed')
        const dasherOrderCounts = maonani.reduce((acc, order) => {
            const dasherId = order.dasherId;
            if(!acc[dasherId]){
                acc[dasherId] = 0;
            }
            acc[dasherId]++;
            return acc;
        },{});
        
      console.log(dasherOrderCounts);
         const completedOrders = allOrders.filter(order => order.status === 'completed').length;
      const cancelledByShop = allOrders.filter(order => order.status === 'cancelled_by_shop').length;
      const cancelledByCustomer = allOrders.filter(order => order.status === 'cancelled_by_customer').length;
      const cancelledByDasher = allOrders.filter(order => order.status === 'cancelled_by_dasher').length;
      const totalOrders = completedOrders + cancelledByShop + cancelledByCustomer + cancelledByDasher;
      const completedPercentage = (completedOrders / totalOrders) * 100;
      const cancelledPercentage = ((cancelledByShop + cancelledByCustomer + cancelledByDasher) / totalOrders) * 100;
      setCompletedOrders(completedPercentage.toFixed(2));
      setCancelledOrders(cancelledPercentage.toFixed(2));




 setCurrentDashers((prevDashers) =>
        prevDashers.map((dasher) => ({
          ...dasher,
          completedOrders: dasherOrderCounts[dasher.id] || 0,
        })).sort((a, b) => b.completedOrders - a.completedOrders));

        }catch(error){
            console.error('Error fetching orders:', error.response.data.error);
        }finally{
            setLoading(false);
        }
    }


  const formatCompletedOrdersByMonth = (orders, selectedYear) => {
  
  const monthNames = [
    "Jan", "Feb", "March", "April", "May", "June",
    "July", "Aug", "Sept", "Oct", "Nov", "Dec"
  ];

  const ordersByMonth = {
    completed: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0 },
    cancelled: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0 }
  };

  orders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const month = orderDate.getMonth() + 1;

    if (orderDate.getFullYear() === selectedYear) {
      if (order.status === "completed") {
        ordersByMonth.completed[month]++;
      }
      else if (["cancelled_by_customer", "cancelled_by_shop", "cancelled_by_dasher"].includes(order.status)) {
        ordersByMonth.cancelled[month]++;
      }
    }
  });

  const xAxisData = monthNames; 
  const yAxisCompleted = Object.values(ordersByMonth.completed); 
  const yAxisCancelled = Object.values(ordersByMonth.cancelled); 

  return { xAxisData, yAxisCompleted, yAxisCancelled };
};


const { xAxisData, yAxisCompleted, yAxisCancelled } = formatCompletedOrdersByMonth(allOrders,selectedYear);


const sampleData = [
  {
    label: 'Completed Orders',
    value: completedOrders,
    color: 'green',
    
  },
  {
    label: 'Cancelled Orders',
    value: cancelledOrders,
    color: 'red',
  },
]

const valueFormatter = (item) => `${item.value}%`;

const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

     useEffect(() => {
  const fetchData = async () => {
    await fetchDashers();
    await fetchOrders();
  };
  fetchData();

}, []);


  return (
    <div className="p-2 items-center justify-center w-full h-full flex flex-col gap-2">
      <div className='flex items-center justify-between w-full gap-8'>
        <div className=' w-[450px] h-[550px] shadow-2xl rounded-2xl p-4 overflow-auto hover:scale-[1.01] transition-transform duration-300'>
        <div className='flex w-full justify-between items-center'>
            <h2 className='font-semibold'>Top Dashers</h2>
            <h2 className='font-semibold'>Total Orders Completed</h2>
        </div>
       {loading ? (<div className="flex justify-center items-center h-full w-full">
                        <div
                            className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                            role="status">
                            <span
                                className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                            >Loading...</span>
                        </div>
                    </div>) : currentDashers.map((dasher, index) => (
          <div key={dasher.id} className="adl-box p-2 rounded-lg overflow-auto">
            <div className="adl-box-content">
              <div className="flex items-center gap-2">
                <span>{index + 1}.</span> 
                <img src={dasher.schoolId} alt="School ID" className="w-10 h-10" />
              </div>
              <div className='w-5'>{dasher.userData.firstname + " " + dasher.userData.lastname}</div>
              <div>{dasher.completedOrders}</div>
            </div>
          </div>
        ))}
        </div>
         <div className='flex flex-col gap-8'>
            <div className='items-center justify-center flex flex-col border  w-[600px] h-[550px] shadow-2xl rounded-2xl p-4 hover:scale-[1.02] transition-transform duration-300'>
           <h2 className='text-2xl font-semibold self-start '>Completed Orders vs Cancelled Orders</h2> 
           {loading ? (<div className="flex justify-center items-center h-full w-full">
                        <div
                            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                            role="status">
                            <span
                                className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                            >Loading...</span>
                        </div>
                    </div>) : 
                    // <h2 className="text-[72px] h-full mt-6">{cancelledOrders}</h2>}
        <PieChart
  series={[
    {
      // data: [
      //   { id: 0, value: completedOrders, label: `Completed Orders`, color:'green' },
      //   { id: 1, value: cancelledOrders, label: `Cancelled Orders`, color:'red' },
      // ],
      data: sampleData,
     faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
    highlightScope: { fade: 'global', highlight: 'item' },
    arcLabel: 'value',
    valueFormatter,
    legend: { direction: 'row', position: { vertical: 'middle', horizontal: 'top' }, padding: 30 },
    },
  ]}
  height={300}
  width={700}
/>   }
        </div>
        </div>
        <div className=' w-[800px] h-[550px] hover:scale-[1.01] transition-transform duration-300 shadow-2xl rounded-2xl p-4 flex flex-col items-center justify-center'>
        <div className='flex items-center justify-between w-full'>
            <h2 className='font-semibold'>Orders Overtime</h2>
            <div className='w-[100px]'>
                 <FormControl fullWidth>
      <InputLabel id="year-select-label">Year</InputLabel>
      <Select
        labelId="year-select-label"
        id="year-select"
        value={selectedYear}
        label="year"
        onChange={handleYearChange}
      >
       {[2023, 2024, 2025, 2026, 2027, 2028].map(year => (
          <MenuItem key={year} value={year}>{year}</MenuItem>
        ))}
      </Select>
    </FormControl>
                </div>
            </div>
            {  loading ? (<div className="flex justify-center items-center h-full w-full">
                        <div
                            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                            role="status">
                            <span
                                className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                            >Loading...</span>
                        </div>
                    </div>):   <LineChart
      xAxis={[{ data: xAxisData, label:'Month',scaleType: 'band' }]}
      series={[
        {
          data: yAxisCompleted, 
          label: 'Completed Orders',
          color: 'green',
        },
        {
          data: yAxisCancelled, 
          label: 'Cancelled Orders',
          color: 'red',
        },
      ]}
      width={800}
      height={500}
    />}
       
        </div>
      </div>
      <div className='w-full h-[200px] hover:scale-[1.01] transition-transform duration-300 shadow-2xl rounded-2xl p-4 overflow-auto'>
        <h2 className='font-semibold'>All Dashers</h2>
         {loading ? (<div className="flex justify-center items-center h-full w-full">
                        <div
                            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                            role="status">
                            <span
                                className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                            >Loading...</span>
                        </div>
                    </div>): allDashers.map(dasher => (
                                <div key={dasher.id} className="adl-box">
                                    <div className="adl-box-content">
                                        <div>{dasher.userData.firstname + " " + dasher.userData.lastname}</div>
                                        <div>{dasher.daysAvailable.join(', ')}</div>
                                        <div>{dasher.availableStartTime}</div>
                                        <div>{dasher.availableEndTime}</div>
                                        <div>
                                            <img src={dasher.schoolId} alt="School ID" className="adl-list-pic" />
                                        </div>
                                        <div>{dasher.status}</div>
                                    </div>
                                </div>
                            ))}
      </div>
    </div>
  );
}


const AdminAnalytics = () => {
const [value, setValue] = useState('2');

const changeValue = (event, newValue) => {
    setValue(newValue);
}
const color = red[400];

    return (
    <div class="h-[100vh] pt-[70px] pr-[50px] pb-0 pl-[120px] flex flex-col items-center justify-center">        
        <TabContext value={value}>

    <div className="w-full h-12 border rounded-t-lg bg-[#BC4A4D] text-white font-semibold" >
      <Tabs
        value={value}
        onChange={changeValue}
        aria-label="wrapped label tabs example"
        textColor='inherit'
       sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: color, // Custom color for the indicator
            },
          }}
        centered
        variant='fullWidth'
      >
        <Tab value="2" label="Dashers" sx={{fontWeight:'bold'}} />
        <Tab value="3" label="Shop" sx={{fontWeight:'bold'}} />
      </Tabs>
         </div>
    <div className="w-full h-[90%] rounded-b-lg border bg-[#FFFAF1]">
  <TabPanel value="2">
           <DashersAnalytics/>
          </TabPanel>
          <TabPanel value="3">
            <ShopAnalytics/>
          </TabPanel>
    </div>
     </TabContext>
        </div>
    );
    }

export default AdminAnalytics;