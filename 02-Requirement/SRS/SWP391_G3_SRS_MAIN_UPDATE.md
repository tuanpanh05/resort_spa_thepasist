

<!-- PAGE 1 -->




Requirement  &  Design  Specification  
Ng┼⌐  S╞ín  Retreat  
GROUP  3  
 Lecturer:  Nguyß╗àn  Mß║ính  C╞░ß╗¥ng  

ΓÇô  Hanoi,  May  2026  ΓÇô    

GAMS-SRS_v1.0   1 /143   




<!-- PAGE 2 -->


Contents  I.  Overview .................................................................................................................................................... 6 1.   System  Context ......................................................................................................................................... 6 2.  User  Requirements ....................................................................................................................... 6 2.1  Actors ............................................................................................................................. 6 2.2  Diagrams ........................................................................................................................ 7 2.3  Descriptions .............................................................................................................................. 12 3.  System  Functionalities ............................................................................................................... 15 3.1  Screens  Flow ................................................................................................................ 15 3.2  Screen  Authorization ................................................................................................... 20 3.3  Non-UI  Functions ........................................................................................................ 21 4.  Main  Business  Processes .......................................................................................................................... 23 II.  Functional  Requirements ....................................................................................................... 26 1.  Authen  v├á  Author ................................................................................................................. 26 1.1  Login ............................................................................................................................ 26 1.2  Register ........................................................................................................................ 27 1.3  Reset  password ............................................................................................................. 28 2.  Order  Manage ...................................................................................................................... 29 3.  System  Admin ...................................................................................................................... 31 4.  Blog  Managerment ............................................................................................................... 32 4.1  Blog  of  admin .............................................................................................................. 32 4.2  Blog  of  Customer  &  Guest .......................................................................................... 34 5.  Manage  Report  and  Static .................................................................................................... 35 6.  User  profile .......................................................................................................................... 36 7.  Public ................................................................................................................................... 38 7.1  Home  Page ................................................................................................................... 38 7.2  View  Product ................................................................................................................ 39 8.  Wish  List .............................................................................................................................. 40 9.  Promotion ............................................................................................................................. 41 9.1  Promotion  for  admin .................................................................................................... 41 9.2  Promotion  for  customer ............................................................................................... 43 10.  VN  Pay ............................................................................................................................... 44 11.  Time  book  service .............................................................................................................. 46 12.  Work  Scheduling ................................................................................................................ 47 13.  Work  Status ........................................................................................................................ 49 14.  Dietary  F&B  Management ................................................................................................. 51 15.  Form  Book  Extra ................................................................................................................ 53 16.  Filter  Retreat  Package ........................................................................................................ 55 
GAMS-SRS_v1.0   2 /143   



<!-- PAGE 3 -->


## 17.  Dashboard  of  Arrivals  and  Check-In ................................................................................. 57 18.  Room  Status ....................................................................................................................... 59 19.  Inventory  Managerment ..................................................................................................... 61 20.  Staff  list .............................................................................................................................. 63 III.  System  design ......................................................................................................................... 64 1.  ERD ...................................................................................................................................... 64 2.  Database  Design ................................................................................................................... 77 2.1  Database  Schema ......................................................................................................... 77 2.1.1  Table  Descriptions .................................................................................................... 77 3.  Code  Packages ..................................................................................................................... 78 3.1  Package  Diagram ......................................................................................................... 78 3.2  Package  Descriptions ................................................................................................... 80 3.2.1  Package  Backend ...................................................................................................... 80 3.2.2  Package  Front-end .................................................................................................... 80 IV.  Requirement  Appendix ........................................................................................................................ 80 4.1  Business  Rules ................................................................................................................................. 80 4.2   Use  Case  Specifications .................................................................................................................. 84 4.2.1  Register  Account  /  Log  In ...................................................................................................... 84 4.2.2  View  Resort  Information ........................................................................................................ 84 4.2.3  Filter  Retreat  Packages ........................................................................................................... 84 4.2.4  Check-In ................................................................................................................................. 84 4.2.5  Check-Out .............................................................................................................................. 84 4.2.6  Manage  Villa  Status ............................................................................................................... 84 4.2.7  View  Booking  Details ............................................................................................................ 84 4.2.8  Book  Extra  Spa  Service ......................................................................................................... 86 4.2.9  View  Arrivals  Dashboard ....................................................................................................... 86 4.2.10  Order  Extra  F&B  Items ........................................................................................................ 86 4.2.11  Complete  Dietary  &  Health  Profile ...................................................................................... 86 4.2.12  Schedule  Spa  Therapy  Session ............................................................................................ 86 4.2.13  Book  Retreat  Package .......................................................................................................... 86 4.2.14  View  Booking  Details .......................................................................................................... 86 4.2.15  Manage  Profile ..................................................................................................................... 86 4.2.16  Pre-select  Daily  Meals ......................................................................................................... 86 4.2.17  Submit  Review  &  Rating ..................................................................................................... 86 4.2.18  View  Daily  Schedule ............................................................................................................ 86 4.2.19  Update  Session  Status .......................................................................................................... 86 4.2.20  View  Daily  Meal  Prep  Dashboard ........................................................................................ 86 4.2.21  Update  Meal  Order  Status .................................................................................................... 87 4.2.22  Manage  Staff  Accounts  &  Roles .......................................................................................... 88 4.2.23  Manage  Villa  &  Room  Master  Data ..................................................................................... 90
GAMS-SRS_v1.0   3 /143   



<!-- PAGE 4 -->


### 4.2.24  Manage  Resort  &  Yoga  Services  Master  Data ..................................................................... 91 4.2.25  Manage  Retreat  Packages  Master  Data ................................................................................ 92 4.2.26  Audit  Invoice  Ledger  &  Transactions .................................................................................. 93 4.2.27  View  Resort  Operations  Dashboard ..................................................................................... 94 4.2.28  Analyze  Weekly  Occupancy  &  Revenue  Trend  Data .......................................................... 94 4.2.29  Manage  Inventory  &  Resort  Supplies .................................................................................. 96 4.2.30  Register  New  Inventory  Item ............................................................................................... 97 4.2.31  Manage  Customer  Reviews,  Feedback,  Complaints ............................................................ 98 4.2.32  Manage  Staff  Shift  Scheduling  &  Attendance ..................................................................... 99 4.2.33  Monitor  Real-time  Room  Status ........................................................................................ 100







GAMS-SRS_v1.0   4 /143   



<!-- PAGE 5 -->


I.  Overview  1.   System  Context     


      Image  detail 
## 2.  User  Requirements  2.1  Actors   #  Actor  Description  1  Guest
An  anonymous  user  who  accesses  the  platform  without  logging  in  or  registering  an  account.  
GAMS-SRS_v1.0   5 /143   




<!-- PAGE 6 -->


# 2  Customer
A  logged-in  customer  who  has  a  validated  account  with  the  resort.  This  actor  inherits  all  base  viewing  privileges  from  the  actor  through  a  generalization  relationship.  .  3  Receptionist  
Front-line  staff  members  who  coordinate  guest  stays,  physical  room  allocations,  and  central  accounting  operations  at  the  resort.   
4  
Spa  Therapist/Yoga  Instructor   
Specialized  wellness  staff  members  who  deliver  physical  treatments,  therapies,  and  fitness  or  mindfulness  instructions  to  the  guests.   
# 5  Chef/F&B  Staff
Culinary  and  food  service  team  members  responsible  for  preparing  personalized,  health-conscious  meals  for  checked-in  resort  guests.   6  Admin  
The  system  administrator  is  tasked  with  technical  upkeep,  infrastructure  security,  master  data  setup,  and  enforcing  user  access  barriers.   7  
Business  Manager  
A  strategic  supervisor  overseeing  the  resort's  high-level  business  performance,  operational  audits,  inventory  pipelines,  and  staff  management.    2.2  Diagrams  2.2.1  UCs  for  Guest   

GAMS-SRS_v1.0   6 /143   




<!-- PAGE 7 -->


### 2.2.2  UCs  for  Customer

GAMS-SRS_v1.0   7 /143   




<!-- PAGE 8 -->


### 2.2.2  UCs  for  Receptionist
### 2.2.3  UCs  for  Spa  Therapist  /  Yoga  Instructor

GAMS-SRS_v1.0   8 /143   




<!-- PAGE 9 -->


### 2.2.4  UCs  for  Chef

GAMS-SRS_v1.0   9 /143   




<!-- PAGE 10 -->


### 2.2.5  UCs  for  Admin

GAMS-SRS_v1.0   10 /143   




<!-- PAGE 11 -->


### 2.2.6  UCs  for  Business  Manager
## 2.3  Descriptions
GAMS-SRS_v1.0   11 /143   

ID  Use  Case  Actor(s)  Use  Case  Description  01  Register  Account  /  Log  In  
Guest  Allows  guests  to  register  a  new  account,  log  in  to  the  system,  and  verify  their  email  address.  02  View  Resort  Information  
Guest  Allows  guests  to  view  package  details,  sample  menus,  room  information,  therapist  information,  package  lists,  and  spa  services  lists.  03  Filter  Retreat  Packages  
Guest  Allows  guests  to  filter  and  search  retreat  packages  based  on  their  preferences.  04  Check-In  Receptionist  Allows  the  receptionist  to  check  in  guests  and  export  the  daily  residence  report.  05  Check-Out  Receptionist  Allows  the  receptionist  to  process  guest  check-out,  update  villa  status,  and  generate  the  consolidated  invoice.  06  Manage  Villa  Status  
Receptionist  Allows  the  receptionist  to  view  and  manage  villa  status  during  guest  stay.  07  View  Booking  Details  
Receptionist  Allows  the  receptionist  to  view  booking  details  and  the  itinerary  timeline.  



<!-- PAGE 12 -->


GAMS-SRS_v1.0   12 /143   

# 08  Book  Extra  Spa  Service
Receptionist  Allows  the  receptionist  to  book  additional  spa  services  for  guests.  09  View  Arrivals  Dashboard  
Receptionist  Allows  the  receptionist  to  view  upcoming  and  current  guest  arrivals.  10  Order  Extra  F&B  Items  
Customer  Allows  customers  to  order  additional  food  and  beverage  items  during  their  stay.  11  Complete  Dietary  &  Health  Profile  
Customer  Allows  customers  to  enter  dietary  restrictions  and  health-related  information.  12  Schedule  Spa  Therapy  Session  
Customer  Allows  customers  to  schedule  spa  therapy  sessions  and  auto-match  therapists  and  rooms.  13  Book  Retreat  Package  
Customer  Allows  customers  to  book  retreat  packages  and  make  a  deposit  payment.  
# 14  View  Booking  Details
Customer  Allows  customers  to  view  booking  details  and  itinerary  information.  
# 15  Manage  Profile  Customer  Allows  customers  to  manage  their  profile  information  and  request  deletion  of  sensitive  data.  16  Pre-select  Daily  Meals
Customer  Allows  customers  to  choose  meals  in  advance  for  their  stay.  
# 17  Submit  Review  &  Rating
Customer  Allows  customers  to  submit  reviews  and  ratings  after  using  services.  18  View  Daily  Schedule  
Spa  Therapist  /  Yoga  Instructor  
Allows  therapists/instructors  to  view  their  daily  schedule  and  guest  health  notes.  
# 19  Update  Session  Status
Spa  Therapist  /  Yoga  Instructor  
Allows  therapists/instructors  to  update  session  status,  mark  sessions  completed,  or  mark  no-shows.  
# 20  View  Daily  Meal  Prep  Dashboard
Chef  /  F&B  Staff  
Allows  staff  to  view  the  daily  meal  preparation  dashboard  and  food  allergy  warnings.  21  Update  Meal  Order  Status  
Chef  /  F&B  Staff  
Allows  staff  to  update  meal  order  status  by  marking  orders  as  preparing  or  ready  for  delivery.  22  Manage  Staff  Accounts  &  Roles  
Admin  Allows  admin  to  create,  lock/unlock  staff  accounts,  and  enforce  role-based  access  control.  
# 23  Manage  Villa  &  Room  Master  Data
Admin  Allows  admin  to  add  or  delete  room  categories  and  manage  villa/room  master  data.  
# 24  Manage  Resort  &  Yoga  Services  Master  Data
Admin  Allows  admin  to  add,  update,  deactivate,  or  suspend  active  services.  
# 25  Manage  Retreat  Packages  Master  Data
Admin  Allows  admin  to  manage  retreat  package  master  data.  


<!-- PAGE 13 -->



GAMS-SRS_v1.0   13 /143   

# 26  Audit  Invoice  Ledger  &  Transactions
Business  Manager  
Allows  the  business  manager  to  review  invoice  ledgers  and  transaction  records.  
# 27  View  Resort  Operations  Dashboard
Business  Manager  
Allows  the  business  manager  to  view  the  resort  operations  dashboard.  
# 28  Analyze  Weekly  Occupancy  &  Revenue  Trend  Data
Business  Manager  
Allows  the  business  manager  to  analyze  weekly  occupancy  and  revenue  trends.  
# 29  Manage  Inventory  &  Resort  Supplies
Business  Manager  
Allows  the  business  manager  to  manage  inventory  and  resort  supplies.  
# 30  Register  New  Inventory  Item
Business  Manager  
Allows  the  business  manager  to  register  new  inventory  items.  
# 31  Manage  Customer  Reviews,  Feedback,  Complaints
Business  Manager  
Allows  the  business  manager  to  manage  customer  reviews  and  feedback.  
# 32  Manage  Staff  Shift  Scheduling  &  Attendance
Business  Manager  
Allows  the  business  manager  to  manage  staff  shifts  and  attendance.  
# 33  Monitor  Real-time  Room  Status
Business  Manager  
Allows  the  business  manager  to  monitor  real-time  room  status.  


<!-- PAGE 14 -->


## 3.  System  Functionalities  3.1  Screens  Flow  3.1.1  Screen  for  Customer  &  Guest

Image  Detail 


GAMS-SRS_v1.0   14 /143   




<!-- PAGE 15 -->


### 3.1.3  Screen  for  Staff

Image  Detail 


GAMS-SRS_v1.0   15 /143   




<!-- PAGE 16 -->


### 3.1.4   Screen  for  chef

Image  Detail 

GAMS-SRS_v1.0   16 /143   




<!-- PAGE 17 -->


### 3.1.5   Screen  for  Admin
 Image  Detail 
GAMS-SRS_v1.0   17 /143   




<!-- PAGE 18 -->


### 3.1.6   Screen  for  Admin

Image  Detail 



GAMS-SRS_v1.0   18 /143   




<!-- PAGE 19 -->


## 3.2  Screen  Authorization
GAMS-SRS_v1.0   19 /143   

Screen  Guest  Customer  Receptionist  
F&BΓÇÖStaff  
SpaΓÇÖStaff  
Admin  
Home  Page  X  X  X  X  X  X  
Login  X  X  X  X  X  X  
Register  X  X      
Forgot  Password  X  X  X  X  X  X  
Customer  service   X  X  X  X  X   
Customer  service  Detail  X  X     X  
Cart  Service   X      
Voucher   X      
Order  History  X  X      
List  Order  X  X  X  X  X  X  
Wishlist  X  X      
Profile   X   X  X   
Update  Profile   X   X  X   
Change  Password   X  X  X  X   
Customer  Profile   X  X  X  X  X  
Promotion  X  X  X  X  X   
Promotion  Detail  X  X  X  X  X   
Blog  X  X  X  X  X   
Blog  Detail  X  X  X  X  X   
Feedback   X  X  X  X   
Customer  Feedback   X      


<!-- PAGE 20 -->


## 3.3  Non-UI  Functions

GAMS-SRS_v1.0   20 /143   

Staff  List       X  
Statistic       X  
Dashboard  X  X  X  X  X  X  
Arivals  Dashboard    X    X  
Room  Status  Matrix     X    X  
Update  Room  Status     X    X  
Daily  Meal  Prep  Dashboard      X    
Consolidated  Invoice    X  X    X  
#  Feature  System  Function  
Description  
# 1  Authentication  &  SSO   Service   Manages  secure  guest  registration,  email  verification  via  OTP/token,  and  integrates  Single  Sign-On  (SSO)  using  Google  Identity  and  Facebook  Login  APIs.

# 2  Role-Based  Access  Control  (RBAC)
Service   Enforces  strict  backend  data  filters  at  the  Controller/SQL  level  to  mask  sensitive  medical  data  based  on  roles  (Therapists  only  see  physical  notes;  Chefs  only  see  food  allergies;  Receptionists  see  neither).   

# 3  Sensitive  Data  Encryption
Service  Implements  database  encryption  (at-rest)  for  highly  sensitive  guest  medical/allergy  profiles  (per  Decree  356/2025/ND-CP)  and  government  


<!-- PAGE 21 -->


GAMS-SRS_v1.0   21 /143   

ID/Passport  records  (per  Law  on  Residence  2020).  

# 4  Right  to  Deletion  Handling
Batch  /  Service   Executes  background  logic  to  permanently  purge  and  wipe  sensitive  physical  health  and  allergy  profiles  from  the  database  once  a  guest's  retreat  officially  ends.   

# 5  2-D  Double-Booking  Prevention
Service  /  Database  Transaction  
Controls  concurrent  scheduling  by  utilizing  database  transaction  locks  to  match  and  reserve  both  an  available  Therapist  and  an  available  Treatment  Room  simultaneously.   
# 6  Calendar  Synchronization
API  /  Service   Integrates  with  the  Google  Calendar  API  to  automatically  sync  booked  Spa  sessions,  yoga  slots,  and  retreat  itineraries  directly  to  the  guest's  personal  calendar.  
# 7  Automated  Email  Reminders
Batch  /  Cron  Job   
Runs  automated  cron  jobs  to  scan  scheduled  sessions  and  trigger  the  SendGrid  API  to  dispatch  email  reminders  to  guests  exactly  1  hour  before  their  therapy  starts.   
# 8  Dietary  Menu  Filtering  Engine
Service    Cross-references  the  guestΓÇÖs  personal  health  profile  with  menu  ingredients  to  automatically  filter  out  unsafe  dishes  and  present  a  personalized,  allergy-safe  meal  selection.   

# 9  Consolidated  Billing  Engine
Service  Aggregates  point-of-sale  costs  by  using  the  Room_Booking_ID  as  the  primary  link  to  push  and  calculate  all  package  costs,  extra  Spa  services,  and  a-la-carte  F&B  bills  into  a  single  Folio  invoice.   

# 10  Payment  Gateway  Integration
API   Connects  with  external  payment  providers  (Stripe,  VNPay  Sandbox,  or  PayPal)  to  process  secure  online  package  deposits  and  handle  final  checkout  balances.   


<!-- PAGE 22 -->










## 4.  Main  Business  Processes    4.1.  Main
 Image  detail  4.2.  Module  1  
 Image  detail    4.3.  Module  2  
GAMS-SRS_v1.0   22 /143   

# 11  Checkout  Constraint  Validator
Service   Evaluates  billing  statuses  at  the  Controller  level,  strictly  blocking  front-desk  staff  from  checking  out  a  guest  if  there  are  any  pending  or  unpaid  extra  Spa  or  F&B  orders.   
# 12  Report  &  Analytics  Exporter
Service   Compiles  operational  data  to  generate  graphical  revenue  dashboards  (breaking  down  income  by  Packages,  Spa,  and  F&B)  and  handles  exporting  daily  police  residence  logs  or  Excel  utilization  reports.   



<!-- PAGE 23 -->


 Image  detail    4.4.  Module  3  
 Image  detail     4.5.  Module  4  
GAMS-SRS_v1.0   23 /143   




<!-- PAGE 24 -->


 Image  detail         4..  Module  5   
 Image  detail 
GAMS-SRS_v1.0   24 /143   




<!-- PAGE 25 -->


II.  Functional  Requirements  1.  Authen  v├á  Author    1.1  Login  
 On  this  screen,  users  can  
ΓùÅ  Input  their  email  or  phone  number.  ΓùÅ  Input  their  password.  ΓùÅ  Select  the  Remember  Me  checkbox.  ΓùÅ  Click  the  Login  button  to  access  the  system.  ΓùÅ  Click  Forgot  Password  to  reset  their  password.  ΓùÅ  Click  Google  /  Facebook  /  Apple  buttons  for  social  login.  ΓùÅ  Click  Register  to  create  a  new  account.  
Field  Description  
Field  Name  Description  
Email  /  Phone  Input   Allows  users  to  enter  their  email  address  or  phone  number   
Password  Input   Allows  users  to  enter  their  account  password   
Show  /  Hide  Password  Icon   
Allows  users  to  toggle  password  visibility   
Login  Button   Submits  login  information  to  access  the  system   
GAMS-SRS_v1.0   25 /143   




<!-- PAGE 26 -->


Google/Apple/Facebook  Login  Button   
Allows  users  to  log  in  using  a  Google/Apple/Faceboo  account   
Register  Prompt   Displays  a  message  for  users  who  do  not  have  an  account   
Register  Link   Redirects  users  to  the  registration  screen    1.2  Register  

On  this  screen,  users  can  
ΓùÅ  Input  their  full  name.  ΓùÅ  Input  their  email  address.  ΓùÅ  Input  their  phone  number.  ΓùÅ  Input  and  confirm  their  password.  ΓùÅ  Show  or  hide  password  fields  while  typing.  ΓùÅ  Accept  the  terms  and  privacy  policy.  ΓùÅ  Click  the  Create  Account  button  to  register.  ΓùÅ  Use  social  registration  options.  ΓùÅ  Navigate  to  the  Login  screen.  
Field  Description  
Field  Name  Description  
Full  Name  Input   Allows  users  to  enter  their  full  name   
GAMS-SRS_v1.0   26 /143   




<!-- PAGE 27 -->


Email  Input   Allows  users  to  enter  their  email  address   
Phone  Number  Input   Allows  users  to  enter  their  phone  number   
Password  Input   Allows  users  to  create  a  password   
Confirm  Password  Input   Allows  users  to  re-enter  the  password  for  confirmation   
Terms  &  Policy  Checkbox   
Allows  users  to  agree  with  the  terms  and  privacy  policy   
Google/Apple/Facebook  Login  Button   
Allows  users  to  log  in  using  a  Google/Apple/Faceboo  account   
Create  Account  Button   Submits  registration  information  to  create  a  new  account      1.3  Reset  password    

On  this  screen,  users  can  
ΓùÅ  Input  their  email  or  phone  number.  ΓùÅ  Request  an  OTP  verification  code.  ΓùÅ  Input  the  OTP  code  received  via  email  or  SMS.  
GAMS-SRS_v1.0   27 /143   




<!-- PAGE 28 -->


ΓùÅ  Input  a  new  password.  ΓùÅ  Confirm  the  new  password.  ΓùÅ  Toggle  password  visibility.  ΓùÅ  Click  the  Reset  Password  button  to  complete  the  process.  ΓùÅ  Navigate  back  to  the  Login  page.  
Field  Description  
Field  Name  Description  
Email  /  Phone  Input   Allows  users  to  enter  their  email  address  or  phone  number   
OTP  Input  Allows  users  to  enter  the  verification  code  sent  to  email  or  phone  
New  Password  Input  Allows  users  to  create  a  new  password  
Confirm  Password  Input    
Allows  users  to  confirm  the  new  password  
Back  To  Login  Link  Redirects  users  back  to  the  login  screen   2.  Order  Manage   

Users  can  do  on  this  screen  
ΓùÅ  View  all  selected  rooms  and  services  before  payment  ΓùÅ  Review  booking  information  such  as  check-in  date,  duration,  and  guest  quantity  ΓùÅ  Increase  or  decrease  the  quantity  of  selected  services  
GAMS-SRS_v1.0   28 /143   




<!-- PAGE 29 -->


ΓùÅ  Remove  rooms  or  services  from  the  cart  ΓùÅ  View  the  payment  summary  including  subtotal,  taxes,  and  total  amount  ΓùÅ  Continue  browsing  and  adding  more  services  or  rooms  ΓùÅ  Proceed  to  the  payment  process  through  VNPay  ΓùÅ  Review  cancellation  policy  and  booking  notes  before  checkout  
Field  Description  
Field  Name  Description  
Cart  Item  List   Displays  all  rooms  and  services  added  to  the  cart  
Product  /  Service  Name   Displays  the  name  of  the  selected  room  or  service  
Booking  Information  Displays  booking  details  such  as  date,  duration,  or  service  time  
Guest  Quantity  Displays  the  number  of  guests  for  each  booking  item  
Unit  Price  Displays  the  price  per  room  or  service  
Total  Price  Displays  the  total  amount  for  each  cart  item  
Tax  &  Service  Fee  Displays  tax  and  additional  service  charges  
Continue  Shopping  Button  
 Redirects  users  back  to  browse  more  rooms  or  services  

GAMS-SRS_v1.0   29 /143   



<!-- PAGE 30 -->


## 3.  System  Admin
 Admin  users  can  do  on  this  screen  
ΓùÅ  View  the  overall  operational  status  of  the  resort  system  ΓùÅ  Monitor  total  bookings,  revenue,  occupancy  rate,  and  customer  statistics  ΓùÅ  Track  room  status  such  as  available,  occupied,  cleaning,  or  maintenance  ΓùÅ  View  recent  activities  happening  across  the  resort  ΓùÅ  Monitor  recent  bookings  and  customer  reservation  status  ΓùÅ  Review  customer  feedback  and  rating  statistics  ΓùÅ  Monitor  payment  statistics  and  transaction  summaries  ΓùÅ  Access  quick  actions  for  common  management  tasks  ΓùÅ  View  notifications  and  important  system  alerts  ΓùÅ  Navigate  to  all  management  modules  such  as  Booking,  Room,  Customer,  Staff,  Service,  
Promotion,

Payment,

Feedback,

and

Reports
 ΓùÅ  Monitor  staff  performance  and  operational  efficiency  ΓùÅ  View  occupancy  trends  and  revenue  analytics  over  time  ΓùÅ  Check  system  alerts  related  to  rooms,  bookings,  or  maintenance  
ΓùÅ

Access

detailed

reports

for

resort

operations

and

business

performance

  Field  Description  
GAMS-SRS_v1.0   30 /143   




<!-- PAGE 31 -->


Field  Name  Description  
Dashboard  Overview  Section  
 Displays  the  overall  operational  summary  of  the  resort  
Total  Booking  Statistic  Displays  the  total  number  of  bookings  in  the  system  
Revenue  Statistic  Displays  the  total  revenue  generated  by  the  resort  
Revenue  Chart  Displays  revenue  trends  over  time  
Recent  Activities  Section  
Displays  the  latest  activities  happening  in  the  resort  system  
Customer  Feedback  Section  
 Displays  customer  ratings  and  recent  reviews  
Quick  Action  Section  Allows  admins  to  quickly  access  important  management  functions  
System  Alert  Section  Displays  important  alerts  or  operational  issues     4.  Blog  Managerment   4.1  Blog  of  admin  

Admin  users  can  do  on  this  screen  
ΓùÅ  View  and  manage  all  blog  posts  in  the  system  
GAMS-SRS_v1.0   31 /143   




<!-- PAGE 32 -->


ΓùÅ  Create  new  blog  posts  ΓùÅ  Edit  existing  blog  posts  ΓùÅ  Delete  blog  posts  ΓùÅ  Publish  or  unpublish  blog  content  ΓùÅ  Manage  blog  categories  and  tags  ΓùÅ  View  blog  status  such  as  published  or  draft  ΓùÅ  Monitor  blog  views  and  engagement  statistics  ΓùÅ  Filter  blog  posts  by  category,  status,  or  publish  date  ΓùÅ  Search  blog  posts  quickly  using  keywords  ΓùÅ  Manage  blog  comments  and  user  interactions  ΓùÅ  View  featured  or  trending  blog  posts  ΓùÅ  Access  media  library  for  blog  images  and  content  assets  ΓùÅ  Navigate  to  related  content  management  modules  
Field  Description  
Field  Name  Description  
Blog  Overview  Section  Displays  general  information  about  blog  management  
Blog  Category  Tabs  Allows  admins  to  switch  between  posts,  categories,  and  comments  
Create  Blog  Button  Allows  admins  to  create  a  new  blog  post  
Blog  List  Section  Displays  all  blog  posts  in  the  system  
Blog  Category  Displays  the  category  assigned  to  the  blog  post  
Customer  Feedback  Section  
 Displays  customer  ratings  and  recent  reviews  
Publish  Status   Displays  the  current  status  such  as  published  or  draft  
Blog  Category  List  Displays  all  available  blog  categories   
GAMS-SRS_v1.0   32 /143   



<!-- PAGE 33 -->


## 4.2  Blog  of  Customer  &  Guest

User  can  do  on  this  screen  
ΓùÅ  Browse  all  blog  posts  published  by  the  resort  ΓùÅ  Read  travel  tips,  resort  news,  promotions,  and  event  articles  ΓùÅ  Search  blog  posts  by  keywords  ΓùÅ  Filter  blog  posts  by  category  ΓùÅ  View  featured  or  popular  blog  articles  ΓùÅ  Navigate  through  multiple  blog  pages  ΓùÅ  Access  detailed  blog  content  by  selecting  a  blog  post  ΓùÅ  Explore  resort  activities,  experiences,  and  updates  ΓùÅ  Access  social  media  and  resort  information  links  
Field  Description  
Field  Name  Description  
Blog  Description  Displays  a  short  introduction  about  resort  news  and  travel  experiences  
Blog  Thumbnail  Displays  the  preview  image  of  each  blog  post  
GAMS-SRS_v1.0   33 /143   




<!-- PAGE 34 -->


Blog  Summary  Displays  a  short  preview  or  summary  of  the  article  
Blog  Publish  Date  Displays  the  publish  date  of  the  article  
Blog  View  Count  Displays  the  number  of  views  for  each  article  
Featured  Blog  Section  Displays  highlighted  or  popular  blog  posts  
Publish  Status   Displays  the  current  status  such  as  published  or  draft  
Navigation  Menu  Allows  users  to  navigate  to  other  resort  pages  such  as  rooms,  spa,  promotions,  and  contact  pages   5.  Manage  Report  and  Static  

Admin  can  do  on  this  screen  
ΓùÅ  View  overall  business  and  operational  statistics  of  the  resort  ΓùÅ  Monitor  revenue,  booking  volume,  occupancy  rate,  and  customer  growth  ΓùÅ  Analyze  business  performance  through  charts  and  analytics  panels  ΓùÅ  Track  room  occupancy  and  service  performance  over  time  ΓùÅ  View  customer  satisfaction  and  feedback  statistics  ΓùÅ  Monitor  recent  transactions  and  payment  activities  ΓùÅ  Compare  revenue  and  booking  trends  by  date  or  period  ΓùÅ  Export  reports  in  PDF  or  Excel  format  
GAMS-SRS_v1.0   34 /143   




<!-- PAGE 35 -->


ΓùÅ  Filter  reports  by  report  type,  date  range,  or  branch/location  ΓùÅ  Monitor  service  efficiency  across  departments  such  as  Spa,  Restaurant,  and  Rooms  ΓùÅ  Analyze  booking  sources  and  payment  methods  ΓùÅ  View  top-performing  rooms  or  services  ΓùÅ  Access  quick  report  shortcuts  for  specific  operational  reports  ΓùÅ  Navigate  to  other  management  modules  from  the  admin  sidebar  
Field  Description  
Field  Name  Description  
Report  Filter  Section  Allows  admins  to  filter  reports  by  type,  date  range,  and  branch  
Revenue  Statistic  Displays  total  revenue  generated  by  the  resort  
Booking  Statistic  Displays  the  total  number  of  bookings  
Customer  Statistic  Displays  the  number  of  customers  and  customer  growth  
Revenue  Structure  Chart   Displays  revenue  distribution  by  services  or  departments  
Service  Performance  Chart  
Displays  operational  performance  of  resort  services  
Top  Service  Section   Displays  the  most  booked  rooms  or  services  
Revenue  Trend  Chart  Displays  revenue  comparison  across  weeks  or  months     6.  User  profile   

Users  can  do  on  this  screen  
GAMS-SRS_v1.0   35 /143   




<!-- PAGE 36 -->


ΓùÅ  View  personal  account  information  ΓùÅ  Update  profile  information  such  as  name,  phone  number,  address,  and  nationality  ΓùÅ  View  account  details  and  membership  status  ΓùÅ  Change  account  password  securely  ΓùÅ  View  account  activity  and  registration  information  ΓùÅ  Save  profile  changes  ΓùÅ  Cancel  editing  actions  if  needed  
Field  Description  
Field  Name  Description  
Profile  Overview  Section  
 Displays  general  account  and  profile  information  
User  Avatar   Displays  the  user's  profile  image  or  avatar  
User  Full  Name   Displays  the  full  name  of  the  account  owner  
Information  Displays  all  information  of  custome  
Edit  Profile  Button  Allows  users  to  enable  profile  editing  mode  
Change  Password  Section  
 Allows  users  to  securely  update  account  password  
Save  Changes  Button  Saves  updated  profile  information  and  password  changes  
Confirm  Password  Input   Allows  users  to  confirm  the  new  password   
GAMS-SRS_v1.0   36 /143   



<!-- PAGE 37 -->


## 7.  Public    7.1  Home  Page

This  screen  allows  users  to:  
ΓùÅ  View  an  overview  of  the  resort  and  main  navigation  links.  ΓùÅ  View  available  rooms  in  the  resort  along  with  their  descriptions.  ΓùÅ  View  featured  rooms.  ΓùÅ  View  ongoing  special  offers/promotions  of  the  resort.  
Field  Description  
Field  Name  Description  
Navigation  Menu   Cho  ph├⌐p  ng╞░ß╗¥i  d├╣ng  ─æiß╗üu  h╞░ß╗¢ng  ─æß║┐n  c├íc  trang  ch├¡nh  nh╞░  Trang  chß╗º,  Blog,  Ph├▓ng  ß╗ƒ,  Spa,  Nh├á  h├áng,  Hß╗Öi  nghß╗ï  hß╗Öi  thß║úo,  Yoga,  Vß║¡t  l├╜  trß╗ï  liß╗çu,  Khuyß║┐n  m├úi  v├á  Th╞░  viß╗çn  ß║únh   
Login/Register  Button   Cho  ph├⌐p  ng╞░ß╗¥i  d├╣ng  ─æ─âng  nhß║¡p  hoß║╖c  ─æ─âng  k├╜  t├ái  khoß║ún   
Banner   Hiß╗ân  thß╗ï  h├¼nh  ß║únh  lß╗¢n  giß╗¢i  thiß╗çu  tß╗òng  quan  vß╗ü  resort   
Room  Review  Section   Khu  vß╗▒c  hiß╗ân  thß╗ï  c├íc  ph├▓ng  nß╗òi  bß║¡t  hoß║╖c  ph├▓ng  ─æ╞░ß╗úc  gß╗úi  ├╜   
Footer  Contact  Information   
Hiß╗ân  thß╗ï  th├┤ng  tin  li├¬n  hß╗ç  cß╗ºa  resort  nh╞░  ─æß╗ïa  chß╗ë,  email  v├á  sß╗æ  ─æiß╗çn  thoß║íi   
Social  Media  Links   Hiß╗ân  thß╗ï  c├íc  li├¬n  kß║┐t  mß║íng  x├ú  hß╗Öi  cß╗ºa  resort   
Promotional  Banner  Image  or  slider  promoting  discounts  or  new  arrivals  
GAMS-SRS_v1.0   37 /143   




<!-- PAGE 38 -->


## 7.2  View  Product

This  screen  allows  users  to:  
ΓùÅ  View  detailed  room  information,  including  room  name,  description,  images,  and  accompanied  
amenities.
 ΓùÅ  View  the  room's  image  gallery  via  main  and  secondary  photos.  ΓùÅ  View  room  capacity,  bed  type,  balcony,  Wi-Fi,  air  conditioning,  and  other  facilities.  ΓùÅ  Select  check-in  date,  check-out  date,  and  the  number  of  guests.  ΓùÅ  Book  a  room  by  clicking  the  "Book  Now"  button.  ΓùÅ  Add  a  room  to  the  wishlist/favorites  list.  ΓùÅ  View  an  overview  of  customer  reviews,  including  average  rating,  star  rating,  and  total  number  of  
reviews.
 ΓùÅ  View  ratings  broken  down  by  criteria  such  as  cleanliness,  service,  amenities,  and  location.  ΓùÅ  Filter  reviews  by  star  rating,  reviews  with  images,  or  all  reviews.  ΓùÅ  Sort  the  review  list  by  time  (recency)  or  relevance.  ΓùÅ  View  detailed  review  content  from  individual  customers.  ΓùÅ  View  images  attached  to  reviews  by  customers.  ΓùÅ  View  the  resort's  responses  to  customer  reviews.  ΓùÅ  Click  "Helpful"  if  the  review  supports  their  booking  decision.  ΓùÅ  View  more  reviews  by  clicking  the  "View  More  Reviews"  button.  ΓùÅ  Navigate  through  pages  in  the  review  list.  
GAMS-SRS_v1.0   38 /143   




<!-- PAGE 39 -->


## 8.  Wish  List

Users  can  do  on  this  screen  
ΓùÅ  View  all  favorite  rooms  and  services  saved  in  the  wishlist  ΓùÅ  Browse  saved  rooms,  spa  services,  restaurant  packages,  and  promotions  ΓùÅ  Search  wishlist  items  by  keyword  ΓùÅ  Filter  wishlist  items  by  category  ΓùÅ  View  room  or  service  details  before  booking  ΓùÅ  Book  rooms  or  services  directly  from  the  wishlist  ΓùÅ  Remove  items  from  the  wishlist  ΓùÅ  View  ratings  and  reviews  of  saved  services  ΓùÅ  Navigate  through  multiple  wishlist  pages  
Field  Description  
Field  Name  Description  
Wishlist  Description  Explains  that  users  can  save  favorite  rooms  and  services  for  future  booking  
Category  Filter  Allows  users  to  filter  wishlist  items  by  category  such  as  Room,  Spa,  Restaurant,  or  Promotion  
GAMS-SRS_v1.0   39 /143   




<!-- PAGE 40 -->


Wishlist  Item  List  Displays  all  saved  wishlist  items  
Room  /  Service  Name  Displays  the  name  of  the  saved  room  or  service  
Wishlist  Item  Description  
 Displays  a  short  description  of  the  room  or  service   
Availability  Status   Displays  current  booking  availability  status  
Book  Now  Button  Allows  users  to  quickly  proceed  with  booking  
Remove  Wishlist  Button  
 Allows  users  to  remove  items  from  the  wishlist  
## 9.  Promotion   9.1  Promotion  for  admin

GAMS-SRS_v1.0   40 /143   




<!-- PAGE 41 -->


Admin  users  can  do  on  this  screen  
ΓùÅ  View  and  manage  all  promotion  campaigns  in  the  resort  system  ΓùÅ  Create  new  promotions  and  discount  campaigns  ΓùÅ  Edit  promotion  information  and  discount  conditions  ΓùÅ  Activate  or  deactivate  promotions  ΓùÅ  Monitor  promotion  usage  and  performance  statistics  ΓùÅ  Filter  promotions  by  status,  type,  or  date  range  ΓùÅ  Search  promotions  by  promotion  code  ΓùÅ  View  coupon  preview  before  publishing  ΓùÅ  Monitor  promotion  expiration  dates  and  availability  ΓùÅ  Manage  discount  percentages,  fixed  discounts,  and  service-based  promotions  ΓùÅ  Track  promotion  usage  quantity  and  remaining  quota  ΓùÅ  View  promotion  details  and  application  conditions  ΓùÅ  Delete  expired  or  unused  promotions  
Field  Description  
Field  Name  Description  
Promotion  Statistic  Section  
Displays  overall  promotion  statistics  such  as  active,  expired,  and  total  usage  
Promotion  Status  Filter  Allows  filtering  promotions  by  current  status  
Date  Range  Filter  Allows  filtering  promotions  by  active  date  range  
Create  Promotion  Button  
Allows  admins  to  create  a  new  promotion  campaign   
Discount  Value  Displays  the  discount  amount  or  percentage  
Start/End  Date  Displays  the  start/  date  of  the  promotion  
Usage  Quantity  Displays  the  number  of  times  the  promotion  has  been  used  
Promotion  Description   Displays  promotion  details  and  customer  benefits   
GAMS-SRS_v1.0   41 /143   



<!-- PAGE 42 -->


## 9.2  Promotion  for  customer

User  can  do  on  this  screen  
ΓùÅ  View  all  available  promotions  and  special  offers  from  the  resort  ΓùÅ  Browse  discounts  for  rooms,  spa  services,  restaurants,  and  combo  packages  ΓùÅ  Search  promotions  by  keyword  ΓùÅ  Filter  promotions  by  category  such  as  Room,  Spa,  Restaurant,  or  Combo  ΓùÅ  Sort  promotions  by  newest  or  current  status  ΓùÅ  View  promotion  details  and  discount  conditions  ΓùÅ  Copy  or  save  promotion  codes  for  booking  ΓùÅ  Apply  promotions  directly  during  booking  ΓùÅ  View  promotion  validity  dates  and  discount  percentages  ΓùÅ  Navigate  through  multiple  promotion  pages  
Field  Description  
Field  Name  Description  
Promotion  Category  Filter  
Allows  users  to  filter  promotions  by  category  
Promotion  Sort  Filter   Allows  users  to  sort  promotions  by  newest  or  active  status  
Promotion  Thumbnail   Displays  preview  images  for  promotions  
Promotion  Description   Displays  short  details  about  the  promotion  benefits  
Discount  Value  Displays  the  discount  percentage  or  special  offer  amount  
GAMS-SRS_v1.0   42 /143   




<!-- PAGE 43 -->


Promotion  Validity  Date  
 Displays  the  start  and  expiration  dates  of  the  promotion   
Promotion  Code  Section  
Displays  promotion  or  coupon  codes  for  customer  use   
Claim  Promotion  Button  
 Allows  users  to  save  or  receive  promotion  offers  
## 10.  VN  Pay

Users  can  do  on  this  screen  
ΓùÅ  Select  VNPay  as  the  payment  method  
GAMS-SRS_v1.0   43 /143   




<!-- PAGE 44 -->


ΓùÅ  Scan  the  QR  code  to  complete  payment  ΓùÅ  Pay  using  ATM  card,  Visa,  Mastercard,  or  QR  Pay  ΓùÅ  View  payment  information  before  confirming  payment  ΓùÅ  Review  the  total  payment  amount  ΓùÅ  View  transaction  ID  and  payment  expiration  time  ΓùÅ  Accept  VNPay  payment  terms  and  conditions  ΓùÅ  Confirm  and  proceed  with  payment  ΓùÅ  Return  to  the  previous  booking  or  cart  page  if  needed  
Field  Description  
Field  Name  Description  
Payment  Method  Section  
Displays  the  selected  VNPay  payment  method  
QR  Code  Section  Displays  the  VNPay  QR  code  for  mobile  payment  
Payment  Information  Section  
Displays  payment  method  support  and  transaction  details  
Supported  Payment  Methods  
 Displays  supported  payment  methods  such  as  ATM,  Visa,  Mastercard,  and  QR  Pay  
Payment  Expiration  Timer  
Displays  the  remaining  time  allowed  for  payment  
Confirm  Payment  Button  
Allows  users  to  proceed  with  VNPay  payment    
Terms  &  Conditions  Checkbox  
 Allows  users  to  agree  with  VNPay  payment  policies  before  proceeding  
Payment  Security  Section  
Displays  security  and  SSL  protection  information  for  payment  safety  

GAMS-SRS_v1.0   44 /143   



<!-- PAGE 45 -->


## 11.  Time  book  service

Users  can  do  on  this  screen  
ΓùÅ  Book  Spa  and  Physical  Therapy  services  online  ΓùÅ  Select  Spa  or  Physical  Therapy  categories  ΓùÅ  Choose  preferred  treatment  services  ΓùÅ  Select  booking  date  from  the  calendar  ΓùÅ  Choose  available  time  slots  ΓùÅ  Enter  personal  booking  information  ΓùÅ  Add  additional  booking  notes  or  special  requests  ΓùÅ  Review  booking  summary  before  confirmation  ΓùÅ  Confirm  or  reset  the  booking  process  
Field  Description  
Field  Name  Description  
Booking  Step  Indicator  Displays  the  current  booking  progress  and  steps  
Service  Category  Tabs  Allows  users  to  switch  between  Spa  and  Physical  Therapy  services  
Service  List  Section  Displays  available  treatment  and  therapy  services  
Service  Description  Displays  short  information  about  the  service  benefits  
Service  Duration  Displays  the  estimated  treatment  duration  
Select  Service  Button  Allows  users  to  choose  a  treatment  service  
GAMS-SRS_v1.0   45 /143   




<!-- PAGE 46 -->


Calendar  Section  Allows  users  to  select  booking  dates  
Therapist  Preference  Section  
Allows  users  to  select  therapist  preferences  if  available  
Time  Slot  Section  Displays  available  booking  times  
Information  Input  Allow  user  input  all  information  
Booking  Summary  Section  
 Displays  selected  service,  date,  time,  and  total  cost   
Confirm  Booking  Button  
Allows  users  to  finalize  the  booking  process  
## 12.  Work  Scheduling

User  can  do  on  this  screen  
GAMS-SRS_v1.0   46 /143   




<!-- PAGE 47 -->


ΓùÅ  View  and  manage  employee  work  schedules  ΓùÅ  Monitor  schedules  for  Spa,  Receptionist,  Chef,  and  other  departments  ΓùÅ  Create  new  work  shifts  for  employees  ΓùÅ  View  schedules  in  daily,  weekly,  or  monthly  calendar  mode  ΓùÅ  Assign  employees  to  specific  shifts  and  departments  ΓùÅ  Track  employee  availability  and  working  hours  ΓùÅ  View  detailed  shift  information  and  assigned  tasks  ΓùÅ  Filter  schedules  by  department  or  employee  ΓùÅ  Approve  or  reject  shift  change  requests  ΓùÅ  Monitor  absent  staff  and  replacement  shifts  ΓùÅ  Synchronize  schedules  with  Google  Calendar  API  ΓùÅ  Send  notifications  to  employees  about  schedule  updates  ΓùÅ  Manage  overlapping  schedules  and  workforce  allocation  
Field  Description  
Field  Name  Description  
Calendar  Navigation  Section  
Allows  admins  to  switch  between  day,  week,  and  month  schedule  views  
Date  Navigation  Controls  
Allows  admins  to  move  between  schedule  dates  
Department  Filter   Allows  filtering  schedules  by  department  such  as  Spa,  Receptionist,  or  Chef  
Create  Shift  Button  Allows  admins  to  create  a  new  work  shift  
Schedule  Calendar  Section  
Displays  employee  schedules  in  calendar  format  
Employee  Assignment  Section  
 Displays  which  employee  is  assigned  to  the  shift  
Weekly  Summary  Section  
 Displays  weekly  staffing  and  scheduling  statistics   
Staff  Availability  Statistic  
Displays  the  number  of  available  employees  
Quick  Action  Section  Allows  admins  to  approve,  reject,  or  duplicate  shifts  
Search  Employee  /  Department  Section  
Allows  searching  schedules  quickly   
Google  Calendar  Sync  Feature  
 Synchronizes  schedules  and  updates  with  Google  Calendar  API  
GAMS-SRS_v1.0   47 /143   



<!-- PAGE 48 -->


Replacement  Shift  Statistic  
Displays  open  or  replacement  shifts    13.  Work  Status   

Admin  can  do  on  this  screen  
ΓùÅ  Monitor  real-time  work  status  across  departments  ΓùÅ  Track  tasks  for  Spa,  Receptionist,  and  Chef/Bß║┐p  staff  ΓùÅ  View  pending,  in-progress,  completed,  and  overdue  tasks  ΓùÅ  Assign  new  tasks  to  employees  ΓùÅ  Update  task  status  and  work  progress  ΓùÅ  Monitor  department  workload  distribution  ΓùÅ  View  detailed  task  information  and  assigned  staff  ΓùÅ  Filter  tasks  by  department,  status,  or  priority  ΓùÅ  Track  daily  operational  activities  and  workflow  updates  ΓùÅ  Manage  urgent  or  high-priority  tasks  ΓùÅ  Coordinate  communication  between  departments  ΓùÅ  View  activity  logs  and  employee  task  history  
GAMS-SRS_v1.0   48 /143   




<!-- PAGE 49 -->



Field  Description  
Field  Name  Description  
Work  Statistic  Section  Displays  total  tasks,  pending  tasks,  completed  tasks,  and  overdue  tasks  
Status  Filter  Allows  filtering  tasks  by  work  status  
Priority  Filter   Allows  filtering  tasks  by  priority  level  
Create  Task  Button  Allows  admins  to  create  new  operational  tasks  
Task  List  Section  Displays  all  assigned  work  tasks  
Task  Information  Displays  task  details  and  assigned  locations  or  customers  
Task  Time   Displays  scheduled  or  assigned  task  time  
Activity  Timeline  Section  
Displays  recent  operational  activities  and  updates  
Assigned  Employee  Information  
Displays  employee  responsible  for  the  task  
Action  Buttons  Allows  admins  to  accept,  update,  or  complete  tasks  
Task  Status   Displays  the  current  progress  status  of  each  task  
Notes  Section  Displays  additional  operational  notes  or  customer  requests   
GAMS-SRS_v1.0   49 /143   



<!-- PAGE 50 -->


## 14.  Dietary  F&B  Management

Admin  users  can  do  on  this  screen  
ΓùÅ  Manage  dietary  and  special  food  requests  from  guests  ΓùÅ  View  meal  preparation  status  in  real  time  ΓùÅ  Monitor  urgent  or  allergy-related  food  requests  ΓùÅ  Track  food  preparation  and  delivery  progress  ΓùÅ  Assign  dietary  requests  to  kitchen  or  F&B  staff  ΓùÅ  View  customer  dietary  restrictions  and  allergies  ΓùÅ  Update  order  preparation  status  ΓùÅ  Filter  requests  by  meal  type,  delivery  status,  or  dietary  condition  ΓùÅ  Monitor  popular  dietary  menu  items  ΓùÅ  Print  food  preparation  orders  for  kitchen  operations  ΓùÅ  Coordinate  communication  between  kitchen  and  service  staff  ΓùÅ  Complete  and  close  dietary  service  requests  

GAMS-SRS_v1.0   50 /143   




<!-- PAGE 51 -->


Field  Description  
Field  Name  Description  
Request  Statistic  Section  
 Displays  total  dietary  requests  and  current  operation  status   
Urgent  Request  Statistic  
 Displays  the  number  of  urgent  or  high-priority  dietary  requests  
Preparation  Status  Statistic  
Displays  requests  currently  being  prepared  
Delivery  Status  Statistic  
 Displays  requests  ready  for  delivery  or  completed  
Filter  Section   Allows  filtering  by  meal  type,  dietary  condition,  or  status  
Dietary  Request  List   Displays  all  dietary  and  food  service  requests  
Allergy  Information   Displays  food  allergies  or  restrictions  
Meal  Type   Displays  meal  categories  such  as  breakfast,  lunch,  or  dinner  
Guest  Information  Displays  guest  name  and  assigned  room  
Request  Status  Displays  preparation  and  delivery  progress  
Chef  Assignment  Information  
 Displays  assigned  kitchen  or  F&B  staff  
Complete  Request  Button  
Allows  staff  to  mark  dietary  requests  as  completed   
Kitchen  Note  Section   Displays  special  preparation  instructions  or  guest  notes  
Print  Order  Button  Allows  staff  to  print  kitchen  preparation  orders  
Popular  Menu  Section   Displays  commonly  requested  dietary  menu  items   
GAMS-SRS_v1.0   51 /143   



<!-- PAGE 52 -->


## 15.  Form  Book  Extra

Users  can  do  on  this  screen  
ΓùÅ  Register  additional  resort  services  before  or  during  their  stay  ΓùÅ  Select  Spa,  Room  Service,  F&B,  Yoga,  or  Physical  Therapy  services  ΓùÅ  Enter  preferred  booking  date  and  time  ΓùÅ  Specify  the  number  of  guests  for  the  service  ΓùÅ  Customize  food  preferences  and  meal  options  ΓùÅ  Inform  the  resort  about  allergies  or  dietary  restrictions  ΓùÅ  Add  special  requests  or  personal  notes  ΓùÅ  Submit  service  registration  information  to  the  resort  ΓùÅ  Reset  and  re-enter  the  form  if  needed  



Field  Description  
GAMS-SRS_v1.0   52 /143   




<!-- PAGE 53 -->


Field  Name  Description  
Customer  Information  Section  
 Allows  users  to  enter  personal  and  contact  information   
Information  Input  Input  all  information  of  customer  
Room  Number  Input  Allows  staying  guests  to  enter  room  number  
Service  Selection  Section  
 Allows  users  to  choose  desired  resort  services   
Service  Checkbox  List   Displays  available  services  such  as  Spa,  Physical  Therapy,  Restaurant,  Yoga,  or  Airport  Pickup  
Preferred  Date  Input   Allows  users  to  select  booking  date  
Preferred  Time  Input   Allows  users  to  select  booking  time  
Guest  Quantity  Input  Allows  users  to  enter  number  of  participants  
Meal  Preference  Section  
 Allows  users  to  customize  food  and  meal  requests  
Meal  Type  Selection   Allows  users  to  select  breakfast,  lunch,  dinner,  vegetarian,  or  diet  meals  
Allergy  Information  Section  
 Allows  users  to  declare  food  allergies  or  health  restrictions  
Special  Note  Input  Allows  users  to  enter  additional  requests  or  health  notes  
Agreement  Checkbox  Allows  users  to  agree  to  service  confirmation  and  contact  policy  
Submit  Form  Button   Allows  users  to  send  the  registration  form  to  the  resort   
GAMS-SRS_v1.0   53 /143   



<!-- PAGE 54 -->


## 16.  Filter  Retreat  Package

Users  can  do  on  this  screen  
ΓùÅ  Browse  retreat  and  wellness  packages  offered  by  the  resort  ΓùÅ  Filter  retreat  packages  by  goals  such  as  Weight  Loss,  Stress  Relief,  or  Yoga  ΓùÅ  Search  retreat  programs  by  keyword  ΓùÅ  Filter  packages  by  duration,  budget,  or  retreat  category  ΓùÅ  Compare  retreat  programs  and  package  details  ΓùÅ  View  retreat  descriptions,  ratings,  and  included  activities  ΓùÅ  View  pricing  and  duration  before  booking  ΓùÅ  Book  retreat  packages  directly  from  the  screen  ΓùÅ  Navigate  through  multiple  retreat  package  pages  
Field  Description  
GAMS-SRS_v1.0   54 /143   




<!-- PAGE 55 -->


Field  Name  Description  
Retreat  Description   
Explains  that  users  can  choose  retreat  programs  based  on  wellness  goals  and  lifestyle  preferences  
Retreat  Category  Filter   Allows  users  to  filter  packages  by  categories  such  as  Weight  Loss,  Stress  Relief,  or  Yoga  
Search  Retreat  Bar  Allows  users  to  search  retreat  packages  by  keyword  
Duration  Filter  Allows  users  to  filter  retreat  packages  by  program  duration  
Budget  Filter  Allows  users  to  filter  retreat  packages  based  on  price  range  
Clear  Filter  Button  Allows  users  to  reset  all  selected  filters  
Retreat  Thumbnail  Displays  preview  images  of  retreat  packages  
Retreat  Description  Summary  
Displays  a  short  overview  of  the  retreat  package  
Retreat  Tags   Displays  package  highlights  such  as  Detox,  Yoga,  Relaxation,  or  Mindfulness  
View  Detail  Button  Redirects  users  to  detailed  retreat  package  information  
Book  Now  Button  Allows  users  to  directly  reserve  a  retreat  package  
Recommended  Retreat  Section  
 Displays  highlighted  or  suggested  retreat  packages   
Retreat  Guide  Section  Displays  quick  instructions  for  choosing  suitable  retreat  programs   
GAMS-SRS_v1.0   55 /143   



<!-- PAGE 56 -->


## 17.  Dashboard  of  Arrivals  and  Check-In

Admin  can  do  on  this  screen  
ΓùÅ  Monitor  guest  arrivals  and  check-in  activities  in  real  time  ΓùÅ  View  all  guests  arriving  on  the  current  day  ΓùÅ  Track  check-in  progress  and  room  assignment  status  ΓùÅ  Manage  VIP  guests  and  priority  arrivals  ΓùÅ  View  early  check-in  and  late  arrival  requests  ΓùÅ  Access  detailed  guest  booking  and  payment  information  ΓùÅ  Confirm  guest  identity  and  registration  details  ΓùÅ  Monitor  room  availability  and  preparation  status  ΓùÅ  Coordinate  reception  and  housekeeping  operations  ΓùÅ  Print  registration  forms  or  check-in  documents  ΓùÅ  Send  guest  notifications  and  check-in  confirmations  ΓùÅ  View  recent  operational  notifications  and  alerts  ΓùÅ  Perform  quick  actions  related  to  check-in  operations  


Field  Description  
GAMS-SRS_v1.0   56 /143   




<!-- PAGE 57 -->


Field  Name  Description  
Arrival  Statistic  Section   
Displays  total  arriving  guests  and  check-in  statistics  
Checked-in  Guest  Statistic  
 Displays  the  number  of  guests  who  completed  check-in  
Pending  Check-in  Statistic  
Displays  guests  waiting  for  check-in  
VIP  Guest  Statistic  Displays  the  number  of  VIP  guests  arriving  today  
Early/late  Check-in  Request  Statistic  
Displays  guests  requesting  early/  check-in  
Booking  ID   Displays  booking  reference  numbers  
Room  Information  Displays  assigned  room  and  room  type  
Special  Request  Information  
 Displays  customer  requests  or  special  notes   
Check-in  Detail  Panel  Displays  detailed  booking  and  guest  information  
Payment  Information  Displays  payment  status  and  booking  charges  
Room  Status  Section  Displays  room  readiness  and  cleaning  status  
Room  Availability  Statistic  
Displays  available,  occupied,  or  maintenance  rooms  
Notification  Section  Displays  operational  alerts  and  recent  check-in  updates   
GAMS-SRS_v1.0   57 /143   



<!-- PAGE 58 -->


## 18.  Room  Status

Admin  can  do  on  this  screen  
ΓùÅ  Monitor  room  availability  and  occupancy  status  in  real  time  ΓùÅ  View  rooms  that  are  available,  occupied,  under  maintenance,  or  being  cleaned  ΓùÅ  Track  check-in  and  check-out  schedules  for  each  room  ΓùÅ  Monitor  housekeeping  and  cleaning  progress  ΓùÅ  View  guest  information  assigned  to  occupied  rooms  ΓùÅ  Manage  room  maintenance  requests  and  repair  schedules  ΓùÅ  Search  rooms  by  room  number,  type,  floor,  or  status  ΓùÅ  Filter  room  lists  based  on  room  condition  or  housekeeping  status  ΓùÅ  Assign  housekeeping  tasks  for  room  cleaning  ΓùÅ  Mark  rooms  as  ready,  occupied,  or  under  maintenance  ΓùÅ  Monitor  room  occupancy  statistics  and  floor  utilization  ΓùÅ  Access  detailed  room  information  and  booking  history  ΓùÅ  View  urgent  room  alerts  and  operational  warnings  
Field  Description  
GAMS-SRS_v1.0   58 /143   




<!-- PAGE 59 -->


Field  Name  Description  
Room  Statistic  Section  Displays  total  rooms  and  room  condition  statistics  
Cleaning  Status  Statistic  
 Displays  rooms  being  cleaned  or  prepared  
Reserved  Room  Statistic  
Displays  rooms  already  booked  in  advance  
Search  Room  Bar  Allows  admins  to  search  rooms  by  room  number  or  guest  name  
Room  Type  Filter  Allows  filtering  rooms  by  room  type  
Room  Status  Filter  Allows  filtering  rooms  by  occupancy  or  maintenance  status  
Housekeeping  Filter  Allows  filtering  rooms  by  housekeeping  condition  
Room  Type   Displays  the  category  or  type  of  room  
Room  Detail  Panel  Displays  detailed  information  about  the  selected  room  
Quick  Action  Section  Allows  admins  to  assign  cleaning,  maintenance,  or  update  room  status  
Maintenance  Alert  Section  
Displays  rooms  requiring  maintenance  attention  
Room  Status  Legend  Displays  explanations  for  room  condition  labels  and  statuses   
GAMS-SRS_v1.0   59 /143   



<!-- PAGE 60 -->


## 19.  Inventory  Managerment

Admin  can  do  on  this  screen  
ΓùÅ  Monitor  all  inventory  and  warehouse  items  in  the  resort  ΓùÅ  Track  stock  quantity  and  warehouse  value  in  real  time  ΓùÅ  View  items  that  are  available,  low  stock,  or  out  of  stock  ΓùÅ  Search  inventory  items  by  name  or  item  code  ΓùÅ  Filter  inventory  by  category,  storage  location,  or  status  ΓùÅ  Add  new  inventory  items  into  the  warehouse  system  ΓùÅ  Update  stock  quantity  and  inventory  information  ΓùÅ  Manage  import  and  export  inventory  transactions  ΓùÅ  Track  inventory  movement  and  warehouse  history  ΓùÅ  Monitor  inventory  alerts  for  low  stock  items  ΓùÅ  View  detailed  information  for  each  inventory  item  ΓùÅ  Export  inventory  reports  to  Excel  
GAMS-SRS_v1.0   60 /143   




<!-- PAGE 61 -->


ΓùÅ  Manage  operational  supplies  for  Spa,  Rooms,  F&B,  and  Maintenance  departments  
Field  Description  
Field  Name  Description  
Inventory  Statistic  Section  
 Displays  overall  inventory  statistics  and  warehouse  status  
Total  Inventory  Statistic  
 Displays  the  total  number  of  inventory  items  
Warehouse  Value  Statistic  
Displays  the  total  value  of  all  inventory  items  
Daily  Import  Statistic  Displays  the  number  of  inventory  import  transactions  today  
Search  Inventory  Bar   Allows  admins  to  search  inventory  items  by  name  or  code  
Import  Inventory  Button   
Allows  admins  to  create  new  warehouse  import  transaction  
Inventory  List  Section   Displays  all  inventory  items  in  the  warehouse  
Storage  Location  Displays  where  inventory  items  are  stored  
Stock  Quantity  Displays  the  current  quantity  in  stock  
Purchase  Price  Displays  inventory  purchase  cost  
Inventory  Detail  Section  
Displays  detailed  information  about  selected  inventory  items   
Create  Export  Request  Button  
 Allows  admins  to  create  inventory  export  requests  
Purchase  Request  Button  
Allows  admins  to  request  additional  inventory  purchases  
Inventory  History  Button  
 Displays  inventory  movement  history  
Low  Stock  Alert  Section  
 Displays  items  requiring  urgent  restocking  
Import  /  Export  History  Section  
 Displays  recent  warehouse  transactions    
GAMS-SRS_v1.0   61 /143   



<!-- PAGE 62 -->


## 20.  Staff  list

Admin  can  do  on  this  screen  
ΓùÅ  View  and  manage  all  resort  employees  ΓùÅ  Monitor  employee  working  status  in  real  time  ΓùÅ  Search  employees  by  name  or  employee  ID  ΓùÅ  Filter  employees  by  department,  position,  or  working  status  ΓùÅ  Add  new  employees  to  the  system  ΓùÅ  Edit  employee  information  and  job  assignments  ΓùÅ  Monitor  employee  schedules  and  current  shifts  ΓùÅ  View  department  workforce  distribution  ΓùÅ  Export  employee  lists  to  Excel  ΓùÅ  Track  employees  who  are  working,  on  leave,  probation,  or  unassigned  
GAMS-SRS_v1.0   62 /143   




<!-- PAGE 63 -->


ΓùÅ  Manage  staff  information  for  Spa,  Receptionist,  Chef,  Housekeeping,  and  Maintenance  
departments
 ΓùÅ  Remove  or  deactivate  employee  accounts  if  necessary  
Field  Description  
Field  Name  Description  
Employee  Statistic  Section  
 Displays  overall  employee  statistics  and  working  conditions   
Total  Employee  Statistic  
 Displays  the  total  number  of  employees  in  the  resort   
Working  Employee  Statistic  
 Displays  the  number  of  employees  currently  working   
Leave  Employee  Statistic  
 Displays  employees  currently  on  leave   
Probation  Employee  Statistic  
 Displays  employees  currently  in  probation  period   
Search  Employee  Bar   Allows  admins  to  search  employees  by  name  or  employee  ID  
Department  Filter  Allows  filtering  employees  by  department  
Status  Filter   Allows  filtering  employees  by  working  status  
Add  Employee  Button  Allows  admins  to  create  new  employee  accounts  
Employee  List  Section  Displays  all  employees  in  the  resort  system  
Action  Buttons  Allows  admins  to  view,  edit,  or  delete  employee  information  
Pagination  Section  Allows  admins  to  navigate  between  employee  list  pages   
III.  System  design  1.  ERD  1.1  Entity  Relationship  Diagram   
GAMS-SRS_v1.0   63 /143   



<!-- PAGE 64 -->


 Image  Detail Entities  Description  
#  Entity  Description  
# 1  User
Stores  core  authentication  and  identification  credentials  for  all  individuals  interacting  with  the  system,  encompassing  both  resort  guests  and  internal  operations  personnel.  
# 2  Work_Schedule
Records  daily  operational  duty  shifts,  designated  work  hours,  and  availability  metrics  for  the  resort's  frontline  staff  members  (Receptionists,  Therapists,  Chefs).   3  Medical_Profile  
Stores  highly  confidential  physical  health  records,  chronic  medical  conditions,  and  severe  dietary  allergen  histories  for  resort  guests.  4  Cart_Item  
Acts  as  a  temporary  caching  data  cache  storing  individual  food  items  or  spa  services  staged  for  purchase  by  an  active  user.  5  Blog  
Manages  promotional  articles,  lifestyle  tips,  wellness  literature,  and  nutritional  advice  content  written  by  authorized  resort  staff.  
GAMS-SRS_v1.0   64 /143   




<!-- PAGE 65 -->


# 6  Room_Booking
Logs  the  master  transactional  entry  point  of  a  core  lodging  agreement  or  retreat  package  combo  reservation  initiated  by  a  primary  customer.  
# 7  Room_Type
Manages  the  general  inventory  classification,  blueprint  capacity,  and  baseline  nightly  standard  rates  of  physical  villas  and  accommodations.  
# 8  Room
Tracks  every  distinct  physical  villa  or  room  asset  allocated  within  the  resort  grounds,  mapping  each  to  an  explicit  unique  identifier  (room_number).  
9  
Room_Booking_Detail  
Breaks  down  the  Many-to-Many  structural  relationship  between  master  reservations  (ROOM_BOOKING)  and  target  physical  structures  (ROOM).  10  
Room_Guest_Declaration  
Stores  the  formal  identity  credentials  of  every  accompanying  companion  occupying  a  room  alongside  the  main  account  holder.  
# 11  Retreat_Package
Serves  as  the  master  catalog  for  structured,  multi-day  wellness  itineraries,  holistic  body  detox  protocols,  or  mental  rejuvenation  packages  aligned  with  Global  Wellness  Institute  (GWI)  standards.  
# 12  Spa_Booking
The  central  operational  entity  recording  a  concrete  appointment  transaction  binding  a  specific  guest,  an  assigned  professional  therapist,  and  a  treatment  room  within  a  precise  time  block.  13  Treatment_Room  
Tracks  individual  spa  massage  beds,  specialized  therapy  rooms,  or  sensory  deprivation  tanks  situated  inside  the  wellness  compound.   
# 14  Spa_Booking
The  central  operational  entity  recording  a  concrete  appointment  transaction  binding  a  specific  guest,  an  assigned  professional  therapist,  and  a  treatment  room  within  a  precise  time  block.  
# 15  Food_Order
Logs  the  overall  transactional  header  of  a  specific  meal  or  table  order  dispatched  to  the  dietary  kitchen  from  a  guest  room  or  walk-in  client.  
# 16  Food_Menu
The  operational  catalog  managing  the  nutritional  meals,  organic  culinary  entries,  and  therapeutic  beverages  produced  by  the  resort's  dietary  kitchen.  
# 17  Food_Order_Detail
Captures  line-by-line  itemizations,  exact  quantities,  and  custom  preparation  directives  for  every  food  item  ordered  under  a  master  FOOD_ORDER.  
18  
Package_Food_Limit  
An  associative  bridge  configuration  table  establishing  daily  meal  consumption  allowances  for  food  items  tied  to  purchased  retreat  packages.  
# 19  Invoice
The  centralized  financial  clearing  ledger  designed  to  pull  outstanding  liabilities  from  all  distinct  operational  points  of  sale  (Lodging,  a  la  carte  Spa,  a  la  carte  F&B)  into  a  unified  master  account.  
# 20  Package_Spa_Limit
A  relational  bridge  configuration  table  mapping  specific  therapeutic  spa  services  to  retreat  packages,  declaring  exact  quantity  limits  included  within  the  package.  
# 21  Spa_Service
The  master  product  catalog  detailing  every  standalone  therapeutic  treatment,  physiotherapy  technique,  or  body  massage  service  offered  at  the  wellness  center.   
GAMS-SRS_v1.0   65 /143   



<!-- PAGE 66 -->


## 1.2  Entity  Details  1.2.1.User    #  Attribute  Name  PK/FK
Type  Mandatory  
Description  
# 1  user_id  PK  INT  IDENTITY(1,1)
Yes  Unique  internal  auto-incremented  identifier  generated  for  every  user  account.  
# 2  email   VARCHAR(255)  Yes  Account  login  email  address;  enforces  a  unique  database  index  to  prevent  duplication.
# 3  password_hash   VARCHAR(500)  Yes  One-way  salted  cryptographic  hash  string  of  the  user  password.
# 4  full_name   NVARCHAR(150)
Yes  Complete  legal  name  of  the  user  profile  holder.  
# 5  phone   VARCHAR(20)  Yes  Contact  telephone  number  for  booking  notifications  and  SMS  alerts.
GAMS-SRS_v1.0   66 /143   



<!-- PAGE 67 -->


# 6  id_passport_encrypted   VARCHAR(MAX)
Yes  AES-256  encrypted  National  ID/Passport  string  for  police  check-in  compliance.  
# 7  role   VARCHAR(30)  Yes  System  permissions  category:  MANAGER ,  RECEPTIONIST,  THERAPIST ,  CHEF ,  CUSTOMER .  Enforced  via  CHECK  (role  IN  (...)) .
# 8  status   VARCHAR(20)  Yes  Profile  status  controller:  ACTIVE  or  INACTIVE .  Enforced  via  CHECK  (status  IN  (...)) .
# 9  created_at   DATETIME  Yes  Historical  timestamp  tracking  when  the  registration  form  was  initialized  (Default:  GETDATE() ).

GAMS-SRS_v1.0   67 /143   



<!-- PAGE 68 -->


### 1.2.2  MEDICAL_PROFILE    #  Attribute  Name  PK/FK
Type  Mandatory  
Description  
# 1  profile_id  PK  INT  IDENTITY(1,1)
Yes  Primary  key  identifying  a  specific  guest  wellness  ledger  entry.  
# 2  user_id  FK  INT  Yes  Maps  directly  to  the  users  table.  Enforces  a  strict  1-1  relational  constraint  ( UNIQUE ).
# 3  physical_condition_encrypted
 NVARCHAR(MAX)  
No  Encrypted  string  containing  physiological  health  tracking  and  active  chronic  diseases.  
GAMS-SRS_v1.0   68 /143   



<!-- PAGE 69 -->


# 4  food_allergies_encrypted   NVARCHAR(MAX)
No  Encrypted  database  field  log  tracking  hazardous  ingredient  alerts  for  the  kitchen.  
# 5  explicit_consent_signed   BIT  Yes  Mandatory  legal  authorization  flag  indicating  explicit  agreement  to  data  handling  rules  (Decree  356/2025).
# 6  updated_at   DATETIME  Yes  Captures  when  a  medical  profile  was  last  updated  or  reviewed  by  staff.
### 1.2.3  WORK_SCHEDULE    #  Attribute  Name
PK/FK  Type  Mandatory  Description  
GAMS-SRS_v1.0   69 /143   



<!-- PAGE 70 -->


# 1  schedule_id  PK  INT  IDENTITY(1,1)
Yes  Unique  identity  tag  for  a  specific  shift  block.  
# 2  staff_id  FK  INT  Yes  Links  to  a  users  record  where  the  role  matches  an  internal  staff  type.
# 3  work_date   DATE  Yes  The  specific  calendar  day  allocated  for  this  shift  line  entry.
# 4  shift_start   TIME  Yes  Clock  execution  time  marking  the  beginning  of  active  working  duty.
# 5  shift_end   TIME  Yes  Clock  execution  time  marking  the  final  conclusion  of  active  working  duty.
# 6  status   VARCHAR(20)  Yes  Labor  metrics  allocation  flags  (e.g.,  ASSIGNED ,  COMPLETED ,  ABSENT ).

GAMS-SRS_v1.0   70 /143   



<!-- PAGE 71 -->


### 1.2.4  RETREAT_PACKAGE    #  Attribute  Name  PK/FK  Type  Mandatory  Description
# 1  package_id  PK  INT  IDENTITY(1,1)  Yes  Unique  structural  product  identifier  for  the  custom  combo  item.
# 2  package_name   NVARCHAR(150)  Yes  Public  branding  name  of  the  retreat  program  (e.g.,  "5-day  Detox  Journey").
# 3  description   NVARCHAR(MAX)  No  Exhaustive  breakdown  of  treatment  philosophies,  items  included,  and  benefits.
# 4  base_price   DECIMAL(15,2)  Yes  Financial  base  price  for  package  registration,  excluding  extra  options.
GAMS-SRS_v1.0   71 /143   



<!-- PAGE 72 -->


# 5  duration_days   INT  Yes  Numerical  count  of  total  calendar  days  the  retreat  covers.
### 1.2.5  PACKAGE_SPA_LIMIT    #  Attribute  Name  PK/FK  Type  Mandatory  Description
# 1  package_spa_id  PK  INT  IDENTITY(1,1)
Yes  Identification  index  for  the  package-spa  relationship  configuration  row.  
# 2  package_id  FK  INT  Yes  Links  configuration  parameters  to  the  master  package  identity.
# 3  spa_id  FK  INT  Yes  Links  configuration  parameters  to  a  distinct  target  spa  operation.
GAMS-SRS_v1.0   72 /143   



<!-- PAGE 73 -->


# 4  quantity_included   INT  Yes  Total  complimentary  structural  service  usage  counts  allowed  within  the  program.
### 1.2.6  PACKAGE_FOOD_LIMIT    #  Attribute  Name  PK/FK  Type  Mandatory  Description
# 1  package_food_id  PK  INT  IDENTITY(1,1)
Yes  Identification  index  for  the  package-food  relationship  configuration  row.  
# 2  package_id  FK  INT  Yes  Links  structural  parameters  to  the  parent  combo  package  identity.
# 3  food_id  FK  INT  Yes  Links  structural  parameters  to  a  distinct  item  on  the  food  menu.
GAMS-SRS_v1.0   73 /143   



<!-- PAGE 74 -->


# 4  quantity_per_day   INT  Yes  Maximum  daily  complimentary  count  threshold  allowed  per  guest.
### 1.2.7  ROOM_TYPE
#  Attribute  Name  PK/FK  Type  Mandatory  Description  
# 1  room_type_id  PK  INT  IDENTITY(1,1)  Yes  Master  inventory  category  identity  key.
# 2  type_name   NVARCHAR(100)  Yes  Commercial  room  label  nomenclature  (e.g.,  "Villa  1BR",  "Presidential  Suite").
# 3  base_price   DECIMAL(15,2)  Yes  Standard  nightly  rate  applied  when  a  room  is  booked  separate  from  a  package.
GAMS-SRS_v1.0   74 /143   



<!-- PAGE 75 -->


# 4  capacity   INT  Yes  Maximum  safe  guest  occupancy  ceiling  enforced  during  booking  workflows.

### 1.2.8  ROOM    #  Attribute  Name  PK/FK  Type  Mandatory  Description
# 1  room_id  PK  INT  IDENTITY(1,1)
Yes  Unique  internal  identifier  generated  for  a  physical  room  unit.  
# 2  room_type_id  FK  INT  Yes  Relates  the  physical  room  asset  to  its  functional  pricing  tier.
# 3  room_number   VARCHAR(30)  Yes  Distinct  physical  room  identifier  (e.g.,  "Villa-101");  unique  index  enforced.
# 4  status   VARCHAR(20)  Yes  Real-time  operations  status  flag  (e.g.,  AVAILABLE ,  OCCUPIED ,  MAINTENANCE ).

GAMS-SRS_v1.0   75 /143   



<!-- PAGE 76 -->


### 1.2.9  ROOM_BOOKING
#  Attribute  Name  PK/FK  Type  Mandatory  Description  
# 1  booking_id  PK  INT  IDENTITY(1,1)
Yes  Master  booking  transaction  identity  key.  
# 2  user_id  FK  INT  Yes  Identifies  the  primary  customer  profile  executing  the  reservation.
# 3  package_id  FK  INT  No  References  the  chosen  combo  package;  set  to  NULL  for  room-only  bookings.
# 4  check_in_date   DATETIME  Yes  Confirmed  reservation  timestamp  marking  the  start  of  the  resort  stay.
# 5  check_out_date   DATETIME  Yes  Confirmed  reservation  timestamp  marking  the  end  of  the  resort  stay.
GAMS-SRS_v1.0   76 /143   



<!-- PAGE 77 -->


# 6  status   VARCHAR(25)  Yes  Workflow  tracking  flag  (e.g.,  PENDING ,  CONFIRMED ,  CHECKED_IN ,  COMPLETED ).
# 7  total_deposit   DECIMAL(15,2)  Yes  Down-payment  amount  processed  online  to  secure  the  reservation  block.
# 8  created_at   DATETIME  Yes  Logs  the  date  and  time  when  the  reservation  transaction  was  first  created.

### 1.2.10  ROOM_BOOKING_DETAIL    #  Attribute  Name  PK/FK  Type  Mandatory  Description
# 1  detail_id  PK  INT  IDENTITY(1,1)
Yes  Unique  primary  key  identifying  a  room  reservation  row.  
GAMS-SRS_v1.0   77 /143   



<!-- PAGE 78 -->


# 2  booking_id  FK  INT  Yes  Connects  the  line  item  directly  to  its  parent  reservation  record.
# 3  room_id  FK  INT  Yes  Connects  the  reservation  line  item  to  a  specific  physical  room  asset.
# 4  price_at_booking   DECIMAL(15,2)  Yes  Captures  and  locks  the  active  nightly  room  rate  at  the  time  of  reservation.
### 1.2.11  .ROOM_GUEST_DECLARATION     #  Attribute  Name  PK/FK
Type  Mandatory  
Description  
# 1  declaration_id  PK  INT  IDENTITY(1,1)
Yes  Unique  primary  index  mapping  a  companion  declaration  profile  row.  
GAMS-SRS_v1.0   78 /143   



<!-- PAGE 79 -->


# 2  booking_detail_id  FK  INT  Yes  Links  the  occupant  data  directly  to  a  specific  reserved  physical  room  detail  row.
# 3  guest_full_name   NVARCHAR(150)
Yes  Complete  legal  name  of  the  accompanying  companion  occupant.  
# 4  guest_id_passport_encrypted
 VARCHAR(MAX)  
Yes  Encrypted  ID/Passport  field  data  used  for  local  police  department  reports.  
# 5  declared_at   DATETIME  Yes  Logs  the  date  and  time  when  the  guest  registration  profile  was  recorded.
### 1.2.12  SPA_SERVICE    #  Attribute  Name  PK/FK  Type  Mandatory  Description
GAMS-SRS_v1.0   79 /143   



<!-- PAGE 80 -->


# 1  spa_id  PK  INT  IDENTITY(1,1)  Yes  Unique  identity  key  generated  for  a  specific  treatment  type.
# 2  service_name   NVARCHAR(150)  Yes  Name  of  the  spa  service  treatment  (e.g.,  "Deep  Tissue  Ayurvedic  Massage").
# 3  description   NVARCHAR(MAX)  Yes  Detailed  explanation  of  therapeutic  techniques  and  organic  oils  used.
# 4  price   DECIMAL(15,2)  Yes  Standard  a-la-carte  rate  billed  when  the  service  is  purchased  outside  a  package.
GAMS-SRS_v1.0   80 /143   



<!-- PAGE 81 -->


# 5  duration_minutes   INT  Yes  Length  of  the  session  block  in  minutes;  used  to  calculate  therapist  availability.
### 1.2.13  TREATMENT_ROOM    #  Attribute  Name  PK/FK  Type  Mandatory  Description
# 1  treatment_room_id  PK  INT  IDENTITY(1,1)
Yes  Unique  primary  key  identifying  a  physical  spa  treatment  space.  
# 2  room_name   NVARCHAR(100)  Yes  Physical  name  or  number  of  the  spa  room  asset  (e.g.,  "Therapy  Room  A").
# 3  status   VARCHAR(20)  Yes  Current  status  indicator  for  the  room  (e.g.,  AVAILABLE ,  OCCUPIED ,  CLEANING ).
### 1.2.14  SPA_BOOKING
GAMS-SRS_v1.0   81 /143   



<!-- PAGE 82 -->


#  Attribute  Name  PK/FK  
Type  Mandatory  Description  
# 1  spa_booking_id  PK  INT  IDENTITY(1,1)
Yes  Unique  primary  key  identifying  an  individual  spa  appointment.  
# 2  user_id  FK  INT  Yes  Identifies  the  specific  customer  profile  attending  the  treatment  session.
# 3  room_booking_id  FK  INT  No  Connects  the  appointment  to  a  room  folio;  set  to  NULL  for  walk-in  clients.
# 4  spa_id  FK  INT  Yes  Identifies  the  chosen  treatment  option  from  the  spa  service  catalog.
# 5  therapist_id  FK  INT  Yes  Links  to  a  user  record  with  a  role  type  matching  THERAPIST .
GAMS-SRS_v1.0   82 /143   



<!-- PAGE 83 -->


# 6  treatment_room_id  FK  INT  Yes  Identifies  the  specific  spa  asset  room  reserved  for  the  session.
# 7  start_datetime   DATETIME  Yes  Scheduled  start  time  for  the  treatment  session.
# 8  end_datetime   DATETIME  Yes  Calculated  session  end  time,  based  on  session  start  +  service  duration.
# 9  status   VARCHAR(25)  Yes  Appointment  status  tracker  (e.g.,  SCHEDULED ,  COMPLETED ,  NO_SHOW ).
# 10  price_at_booking   DECIMAL(15,2)  Yes  Captures  and  locks  the  active  service  price  rate  at  the  time  of  booking.
# 11  is_package_included   BIT  Yes  Flag  checking  if  the  session  cost  is  offset  by  an
GAMS-SRS_v1.0   83 /143   



<!-- PAGE 84 -->


active  retreat  package.  
### 1.2.15  CART_ITEM     #  Attribute  Name
PK/FK  Type  Mandatory  Description  
# 1  cart_id  PK  INT  IDENTITY(1,1)
Yes  Unique  key  identifying  a  specific  line  item  row  inside  the  cart.  
# 2  user_id  FK  INT  Yes  Links  the  virtual  shopping  cart  row  directly  to  its  owner  profile.
# 3  item_type   VARCHAR(20)  Yes  Categorizes  the  item  type  (e.g.,  SPA  or  FOOD ).  Enforced  via  CHECK .
# 4  item_id   INT  Yes  Target  entity  index  number  pointing  to  either  the  target  spa  or  food  item.
GAMS-SRS_v1.0   84 /143   



<!-- PAGE 85 -->


# 5  quantity   INT  Yes  Number  of  units  requested  for  purchase  within  the  transaction  line.
# 6  created_at   DATETIME  Yes  Tracks  when  the  product  row  entry  was  added  to  the  active  user  cart  session.
### 1.2.16  FOOD_MENU    #  Attribute  Name
PK/FK  Type  Mandatory  Description  
# 1  food_id  PK  INT  IDENTITY(1,1)  Yes  Master  food  menu  product  item  index  identity  key.
# 2  dish_name   NVARCHAR(150)  Yes  Name  of  the  culinary  dish  (e.g.,  "Organic  Avocado  Quinoa  Salad").
GAMS-SRS_v1.0   85 /143   



<!-- PAGE 86 -->


# 3  description   NVARCHAR(MAX)  Yes  Complete  breakdown  of  ingredients  and  macro-nutrient  distributions.
# 4  price   DECIMAL(15,2)  Yes  Standard  retail  meal  rate  billed  outside  package  allowances.
# 5  dietary_tags   NVARCHAR(255)  Yes  Group  tags  matching  medical  profiles  (e.g.,  "Vegan,  Keto,  Diabetic-friendly").
### 1.2.17  FOOD_ORDER    #  Attribute  Name  PK/FK  Type  Mandatory  Description
# 1  order_id  PK  INT  IDENTITY(1,1)
Yes  Master  meal  order  transaction  header  identity  key.  
# 2  user_id  FK  INT  Yes  Identifies  the  customer  profile
GAMS-SRS_v1.0   86 /143   



<!-- PAGE 87 -->


placing  the  food  order.  
# 3  room_booking_id  FK  INT  No  Connects  the  order  to  a  room  folio;  set  to  NULL  for  walk-in  diners.
# 4  order_time   DATETIME  Yes  Logs  the  date  and  time  when  the  kitchen  order  ticket  was  received.
# 5  status   VARCHAR(25)  Yes  Kitchen  workflow  status  flags  (e.g.,  PREPARING ,  READY ,  DELIVERED ).
# 6  total_amount   DECIMAL(15,2)  Yes  Total  financial  liability  balance  calculated  for  all  listed  order  line  items.
### 1.2.18  FOOD_ORDER_DETAIL    #  Attribute  Name  PK/FK  Type  Mandatory  Description
GAMS-SRS_v1.0   87 /143   



<!-- PAGE 88 -->


# 1  order_detail_id  PK  INT  IDENTITY(1,1)
Yes  Unique  primary  key  identifying  a  food  order  item  row.  
# 2  order_id  FK  INT  Yes  Links  the  item  row  directly  to  its  parent  master  kitchen  order  ticket.
# 3  food_id  FK  INT  Yes  Connects  the  order  line  to  a  specific  dish  on  the  menu.
# 4  quantity   INT  Yes  Total  item  units  requested  for  preparation  by  the  kitchen  staff.
# 5  price_at_order   DECIMAL(15,2)  Yes  Captures  and  locks  the  active  menu  item  price  at  the  time  of  ordering.
GAMS-SRS_v1.0   88 /143   



<!-- PAGE 89 -->


# 6  special_note   NVARCHAR(255)  No  Custom  customer  cooking  preparation  warnings  or  substitution  requests.
# 7  is_package_included   BIT  Yes  Flag  checking  if  the  item  cost  is  offset  by  an  active  retreat  package.
### 1.2.19  INVOICE    #  Attribute  Name  PK/FK
Type  Mandatory  Description  
# 1  invoice_id  PK  INT  IDENTITY(1,1)
Yes  Central  fiscal  ledger  transaction  identity  key.  
# 2  user_id  FK  INT  Yes  Identifies  the  customer  profile  responsible  for  settling  the  invoice  balance.
# 3  room_booking_id  FK  INT  Yes  Links  the  ledger  back  to  its  core  accommodation  or  package  reservation.
GAMS-SRS_v1.0   89 /143   



<!-- PAGE 90 -->


# 4  room_subtotal   DECIMAL(15,2)
Yes  Accumulated  fixed  historical  costs  for  lodging  options  and  package  bases.  
# 5  spa_subtotal   DECIMAL(15,2)
Yes  Sum  total  of  a-la-carte  spa  bookings  where  is_package_included  is  FALSE.  
# 6  food_subtotal   DECIMAL(15,2)
Yes  Sum  total  of  a-la-carte  food  orders  where  is_package_included  is  FALSE.  
# 7  tax_and_fees   DECIMAL(15,2)
Yes  Calculated  state  VAT  levies  and  service  fee  add-ons.  
# 8  final_amount   DECIMAL(15,2)
Yes  Final  net  cash  balance  due  for  payment,  computed  as  subtotals  +  taxes.  
# 9  status   VARCHAR(20)  Yes  Ledger  status  tracking  flags  (e.g.,  UNPAID ,  PAID ,  REFUNDED ).
# 10  vnpay_tran_id   VARCHAR(100)
No  External  transaction  reference  reference  ID  string  returned  by  the  VNPay  gateway.  
GAMS-SRS_v1.0   90 /143   



<!-- PAGE 91 -->


# 11  payment_time   DATETIME  No  Logs  the  exact  date  and  time  when  payment  settlement  was  verified.
### 1.2.20  BLOG
#  Attribute  Name  
PK/FK  Type  Mandatory  Description  
# 1  blog_id  PK  INT  IDENTITY(1,1)  Yes  Unique  primary  key  identifying  a  specific  blog  article  entry.
# 2  author_id  FK  INT  Yes  Links  to  a  user  record  with  a  role  type  matching  an  internal  staff  type.
# 3  title   NVARCHAR(255)  Yes  Public  headline  string  displayed  for  the  media  entry.
# 4  content   NVARCHAR(MAX)  Yes  Raw  body  copy  and  textual  payload  for  the  article.
GAMS-SRS_v1.0   91 /143   



<!-- PAGE 92 -->


# 5  status   VARCHAR(20)  Yes  Content  visibility  state  flags  (e.g.,  DRAFT ,  PUBLISHED ,  ARCHIVED ).
# 6  created_at   DATETIME  Yes  Logs  when  the  document  database  row  entry  was  initialized.
### 1.2.21  FEEDBACK    #  Attribute  Name
PK/FK  
Type  Mandatory  
Description  
1  
feedback_id  PK  INT  IDENTITY(1,1)  
Yes  Unique  index  tag  mapping  an  individual  customer  review  row.  
2  
user_id  FK  
INT  Yes  Identifies  the  customer  profile  submitting  the  review  transaction.  
GAMS-SRS_v1.0   92 /143   



<!-- PAGE 93 -->


3  
room_booking_id  FK  
INT  Yes  Connects  the  review  to  a  verified  stay  history  record  to  avoid  fake  reviews.  
4  
rating   
INT  Yes  Numeric  quality  satisfaction  score,  constrained  on  a  scale  from  1  to  5  stars.  
5  
comment   NVARCHAR(MAX)  
No  Text  review  detailing  the  guest's  holistic  experience  at  the  resort.  
6  
is_toxic   
BIT  Yes  Automated  check  validation  flag  mapping  if  language  was  toxic/inappropriate.  
GAMS-SRS_v1.0   93 /143   



<!-- PAGE 94 -->


7  
created_at   
DATETIME  Yes  Logs  the  date  and  time  when  the  feedback  review  entry  was  submitted.  
## 2.  Database  Design  2.1.  Database  Schema
 Image  detail 2.2  Table  Descriptions   No.  Table  Name  Operational  &  Business  Description  
GAMS-SRS_v1.0   94 /143   




<!-- PAGE 95 -->


# 01  users  Stores  core  authentication  and  credentials  for  all  accounts,  including  guests  and  internal  staff  (Admin,  Receptionist,  Therapist,  Chef).
# 02  medical_profile  Stores  highly  confidential  physical  health  data,  medical  conditions,  and  severe  food  allergen  histories  (AES-256  encrypted).
# 03  work_schedule  Records  daily  operational  duty  shifts,  assigned  hours,  and  availability  metrics  for  frontline  staff.
# 04  retreat_package  Serves  as  the  master  catalog  for  multi-day  wellness  itineraries  and  holistic  packages  (e.g.,  5-day  Detox  Journey).
# 05  room_type  Manages  lodging  inventory  classifications,  baseline  capacities,  and  standard  nightly  baseline  rates  for  physical  accommodations.
# 06  room  Tracks  every  distinct  physical  villa  or  room  asset  allocated  within  the  resort  grounds  mapped  to  a  unique  room  number.
# 07  room_booking  Logs  the  master  transactional  entry  point  for  core  lodging  agreements  and  bundled  retreat  package  reservations.
# 08  room_booking_detail  Breaks  down  the  Many-to-Many  structural  relationship  between  master  reservations  and  specific  physical  rooms.
GAMS-SRS_v1.0   95 /143   



<!-- PAGE 96 -->


# 09  room_guest_declaration  Stores  formal  identity  credentials  of  accompanying  companions  for  local  police  temporary  residence  compliance.
# 10  spa_service  The  master  product  catalog  detailing  standalone  therapeutic  treatments,  physiotherapies,  or  body  massages.
# 11  treatment_room  Tracks  individual  spa  massage  beds,  specialized  therapy  rooms,  or  sensory  deprivation  spaces  inside  the  compound.
# 12  spa_booking  The  central  operational  entity  recording  a  concrete  spa  appointment  binding  a  guest,  therapist,  room,  and  time  block.
# 13  food_menu  The  operational  catalog  managing  organic  culinary  meals,  nutritional  distribution  info,  and  beverage  lists.
# 14  food_order  &  detail  Logs  the  transactional  headers  and  line-by-line  itemizations  for  customized  meal  prep  or  a-la-carte  point-of-sale  orders.
# 15  invoice  The  central  clearing  financial  ledger  designed  to  pull  outstanding  liabilities  from  all  points  of  sale  into  a  unified  folio  account.
# 16  feedback  Maps  individual  customer  quality  reviews,  numeric  satisfaction  ratings,  and  comments  regarding  their  stay  history.
GAMS-SRS_v1.0   96 /143   



<!-- PAGE 97 -->


## 3.  Code  Packages  3.1  Package  Diagram   3.1.1  Backend  package  diagram
### 3.1.2  Front-end  package  diagram
GAMS-SRS_v1.0   97 /143   




<!-- PAGE 98 -->


## 3.2  Package  Descriptions  3.2.1  Package  Backend  No  Package  Description  01  config  This  folder  contains  database  configuration  files  establishing  secure  connections  to  the  Microsoft  SQL  Server  instance  (e.g.,  database.js),  as  well  as  integration  parameters  for  external  payment  gateways  (vnpay.js  /  payos.js)  02  models  This  folder  defines  the  Data  Entities  mapped  directly  to  relational  database  tables  inside  MS  SQL  Server.  03  controller  This  folder  manages  controllers  responsible  for  handling  business  logic  for  specific  client  requests.  04  middleware  This  folder  contains  middleware  files,  including  authentication  checks  (auth.js),  toxicity  content  checking  (checkToxicity.js),  and  file  upload  handling  (upload.js).  05  uploads  This  folder  stores  files  uploaded  from  the  client,  serving  features  like  image  and  document  uploads.  06  routes  This  folder  contains  route  definitions  for  the  application,  routing  HTTP  requests  to  the  correct  controllers.  07  services  This  folder  includes  auxiliary  services,  such  as  emailService.js  for  sending  emails  to  users  or  administrators.  08  node_modules  This  folder  contains  Node.js  modules  installed  via  npm,  providing  necessary  libraries  and  packages  for  the  project.   3.2.2  Package  Front-end     No  Package  Description
GAMS-SRS_v1.0   98 /143   




<!-- PAGE 99 -->


# 01  components  Contains  reusable  UI  components  of  the  application,  such  as  buttons,  inputs,  modals,  layouts,  etc.  These  components  can  be  used  across  various  pages.  02  utils  Contains  utility  functions  and  logic  unrelated  to  the  UI,  such  as  data  processing  functions,  validation,  date  formatting,  and  API  connection  utilities.  03  assets  Stores  static  resources  of  the  application,  such  as  images,  icons,...  These  files  are  commonly  used  by  components  and  pages.  04  pages  Contains  the  applicationΓÇÖs  pages,  where  each  page  is  a  complete  user  interface  screen.  For  example,  the  Home  page,  About  page,  Profile  page,  or  any  other  navigable  page.  05  config  Contains  configuration  files  of  the  application,  including  API  connection  information,  environment  variables,  or  general  settings  used  throughout  the  application.

IV.  Requirement  Appendix  4.1  Business  Rules  ID  Rule  Name  Detailed  Description  Reference  (UC)  BR-01  Unique  Email  Each  email  address  shall  be  registered  to  only  one  account.  
UC01  
BR-02  Email  Verification  Users  shall  verify  their  email  before  accessing  customer  functions.  
UC01  
BR-03  Public  Information  Access  
Guests  may  view  resort  information  without  logging  in.  
UC02  
BR-04  Active  Package  Availability  
Only  active  retreat  packages  shall  be  available  for  booking.  
UC03,  UC25  
BR-05  Deposit  Requirement  A  booking  shall  be  confirmed  only  after  the  required  deposit  is  paid.  
UC13  
BR-06  Villa  Availability  Validation  
Only  available  villas  shall  be  eligible  for  booking.  
UC13,  UC23  
BR-07  Health  Profile  Requirement  
Customers  shall  complete  the  required  Health  &  Dietary  Profile  before  scheduling  therapy  sessions.  
UC11,  UC12  
GAMS-SRS_v1.0   99 /143   



<!-- PAGE 100 -->


BR-08  Therapist  Availability  A  therapist  shall  not  be  assigned  to  overlapping  sessions.  
UC12,  UC18  
BR-09  Therapy  Room  Availability  
A  therapy  room  shall  not  be  assigned  to  more  than  one  session  at  a  time.  
UC12  
BR-10  Meal  Selection  Deadline  
Meal  selections  must  be  submitted  before  the  configured  cutoff  time.  
UC16  
BR-11  Allergy  Warning  The  system  shall  display  food  allergy  warnings  based  on  customer  profiles.  
UC11,  UC20  
BR-12  Check-in  Validation  Only  confirmed  bookings  shall  be  eligible  for  check-in.  
UC04  
BR-13  Villa  Occupancy  Update  
Villa  status  shall  be  changed  to  'Occupied'  after  successful  check-in.  
UC04,  UC06,  UC33  
BR-14  Villa  Release  Update  Villa  status  shall  be  updated  after  guest  check-out.  
UC05,  UC06,  UC33  
BR-15  Invoice  Generation  The  system  shall  automatically  generate  a  final  invoice  during  the  check-out  process.  
UC05  
BR-16  Extra  Service  Eligibility  
Only  checked-in  customers  may  request  additional  services.  
UC08,  UC10  
BR-17  Session  Status  Update  Therapists  shall  update  the  status  of  each  scheduled  session.  
UC19  
BR-18  Review  Eligibility  Only  customers  who  completed  their  stay  may  submit  reviews.  
UC17,  UC31  
BR-19  Single  Review  Per  Booking  
Each  booking  shall  allow  only  one  review  submission.  
UC17,  UC31  
GAMS-SRS_v1.0   100 /143   



<!-- PAGE 101 -->


BR-20  Sensitive  Data  Deletion  
The  system  shall  process  customer  requests  to  delete  sensitive  personal  data.  
UC15  
BR-21  Role-Based  Access  Control  
Users  shall  access  only  functions  permitted  by  their  assigned  role.  
UC22,  UC28-UC33  
BR-22  Account  Lock  Restriction  
Locked  accounts  shall  not  be  allowed  to  log  in.  
UC22  
BR-23  Service  Availability  Control  
Deactivated  or  suspended  services  shall  not  be  available  for  booking.  
UC24  
BR-24  Unique  Inventory  Item  Code  
Each  inventory  item  shall  be  assigned  a  unique  inventory  code.  
UC30  
BR-25  Non-Negative  Inventory  
Inventory  quantity  shall  never  be  less  than  zero.  
UC29,  UC30  
BR-26  Transaction  Audit  Trail  
All  financial  transactions  shall  be  recorded  for  auditing  purposes.  
UC26,  UC28  
BR-27  Revenue  Calculation  Rule  
Revenue  reports  shall  include  only  valid  completed  transactions.  
UC26,  UC28  
BR-28  Shift  Conflict  Prevention  
Staff  members  shall  not  be  assigned  overlapping  work  shifts.  
UC32  
BR-29  Real-Time  Room  Status  
Room  status  updates  shall  be  synchronized  and  reflected  in  real  time  across  all  authorized  interfaces.  
UC33  
BR-30  Booking  Timeline  Consistency  
All  scheduled  activities  shall  occur  within  the  booking  period.  
UC07,  UC14  

GAMS-SRS_v1.0   101 /143   



<!-- PAGE 102 -->


### 4.2.  Use  Case  Specifications  4.2.1  Register  Account  /  Log  In
GAMS-SRS_v1.0   102 /143   

ID  and  Name:  UC-01  ΓÇô  Register  Account  /  Log  In   
Primary  Actor:  Guest   Secondary  Actors:  Authentication  API  (Google  Identity  /  Facebook  Login)   
Description:  Allows  guests  to  register  a  new  account,  log  in  to  the  system,  and  verify  their  email  address.  Secure  Single  Sign-On  (SSO)  is  provided  for  seamless  guest  registration.   
Trigger:  Guest  selects  "Register"  or  "Log  In"  from  the  application  interface.   
Preconditions:  1.  Staff  is  logged  into  the  system.  2.  Guest  account  must  not  be  locked  (BR-22).   
Postconditions:  1.  New  user  accounts  are  created  with  verified  email  addresses.   2.  Guest  is  securely  authenticated  and  granted  access  to  customer  functions.   
Normal  Flow:  1.  Guest  selects  the  Register  or  Log  In  option.  2.  System  prompts  for  account  credentials  or  SSO  selection.  3.  Guest  inputs  information  or  selects  an  SSO  provider  (Google  Identity  /  Facebook  Login).  4.  System  validates  that  each  email  address  is  registered  to  only  one  account  (BR-01).  5.  System  sends  a  verification  email  for  new  standard  registrations.  6.  Guest  verifies  their  email  before  accessing  customer  functions  (BR-02).  7.  System  authenticates  the  user  and  grants  access.   Alternative  Flows:  
## 1.  System  retrieves  authenticated  data  from  the  Authentication  API  and  creates  the  account  automatically.  2.  Email  verification  step  is  bypassed  as  it  is  handled  by  the  SSO  provider.
Exceptions:  E1.  Email  already  exists.  
->  System  displays  a  warning  message  preventing  duplicate  registration.  
E2.  Account  is  locked.  
->  System  prevents  login  and  displays  a  locked  account  error  (BR-22).  


<!-- PAGE 103 -->



### 4.2.2  View  Resort  Information
GAMS-SRS_v1.0   103 /143   

Priority:  High   
Frequency  of  Use:  High  
Business  Rules:  BR-01  ΓÇô  Unique  Email  
BR-02  ΓÇô  Email  Verification  
BR-22  ΓÇô  Account  Lock  Restriction  
Other  Information:  
Integrates  with  external  Authentication  API   
Assumptions:  Guests  have  access  to  their  email  inbox  to  complete  the  verification  process.   
ID  and  Name:  UC-02  ΓÇô  View  Resort  Information   
Primary  Actor:  Guest   Secondary  Actors:  None   
Description:  Allows  guests  to  view  package  details,  sample  menus,  room  information,  therapist  information,  package  lists,  and  spa  services  lists.   
Trigger:  Guest  navigates  to  the  public  landing  pages  of  the  application.   
Preconditions:  The  system  is  accessible  and  online.   
Postconditions:  Guest  successfully  retrieves  and  views  the  requested  resort  information.   
Normal  Flow:  1.  Guest  selects  an  information  category  (e.g.,  Retreat  Packages,  Spa  Services).  2.  System  retrieves  active  master  data  managed  by  the  System  Manager.  3.  System  displays  the  information  to  the  guest.  4.  Guest  views  the  information  without  needing  to  log  in  (BR-03).   Alternative  Flows:  
None   
Exceptions:  E1.  Data  retrieval  failure.  System  displays  a  friendly  error  message  prompting  the  user  to  refresh  the  page.  
Priority:  Medium   
Frequency  of  Use:  High   


<!-- PAGE 104 -->


### 4.2.3  Filter  Retreat  Packages
GAMS-SRS_v1.0   104 /143   

Business  Rules:  BR-03  ΓÇô  Public  Information  Access   
Other  Information:  
Master  data  uses  industry-standard  terms  guided  by  Global  Wellness  Institute  (GWI)  Standards  (e.g.,  Mindfulness  Retreat,  Detoxification).   
Assumptions:  System  Manager  has  already  populated  the  master  data.   
ID  and  Name:  UC-03  ΓÇô  Filter  Retreat  Packages    
Primary  Actor:  Guest   Secondary  Actors:  None   
Description:  Allows  guests  to  filter  and  search  retreat  packages  based  on  their  specific  goals,  such  as  Weight  Loss,  Stress  Relief,  or  Yoga.   
Trigger:  Guest  applies  filter  criteria  on  the  Retreat  Packages  page.    
Preconditions:  Master  Data  for  Retreat  Packages  is  configured.   
Postconditions:  The  system  displays  a  filtered  list  of  retreat  packages  matching  the  guest's  criteria.   
Normal  Flow:  1.  Guest  navigates  to  the  Retreat  Packages  page.  2.  Guest  inputs  filter  criteria  (e.g.,  goal,  duration).  3.  System  processes  the  request  and  queries  the  database.  4.  System  verifies  that  only  active  retreat  packages  are  returned  (BR-04).  5.  System  displays  the  filtered  results  to  the  guest.   Alternative  Flows:  A1.  No  matching  packages.  
->  System  informs  the  guest  that  no  packages  match  their  criteria  and  suggests  clearing  filters.  
Exceptions:  E1.  System  timeout.   
->  System  prompts  user  to  try  their  search  again.  
Priority:  High   
Frequency  of  Use:  High   
Business  Rules:  BR-04  ΓÇô  Active  Package  Availability   


<!-- PAGE 105 -->


### 4.2.4  Check-In
GAMS-SRS_v1.0   105 /143   

Other  Information:  
None   
Assumptions:  Guests  understand  the  filtering  options  provided.  
ID  and  Name:  UC-04  ΓÇô  Check-In  
Primary  Actor:  Receptionist   Secondary  Actors:  System  Manager   
Description:  Allows  the  receptionist  to  check  in  guests,  assign  a  physical  villa  number,  collect  mandatory  identification  data,  and  export  the  daily  residence  report  for  local  police.   
Trigger:  Guest  arrives  at  the  front  desk  to  begin  their  retreat.  
Preconditions:  Receptionist  is  authenticated.  
Guest  has  a  valid  booking.  
Postconditions:  Guest  is  officially  checked  in.  
Villa  status  is  updated  to  Occupied  (BR-13).  
Guest  ID  data  is  encrypted  at  rest.  
Normal  Flow:  1.  Receptionist  searches  for  the  guest's  booking.  2.  System  validates  that  the  booking  is  confirmed  before  allowing  check-in  (BR-12).  3.  Receptionist  collects  necessary  ID  data  for  temporary  residence  declaration.  4.  Receptionist  assigns  a  physical  villa  number  to  the  guest.  5.  Receptionist  confirms  the  check-in  process  in  the  system.  6.  System  changes  the  villa  status  to  "Occupied"  (BR-13).  7.  System  encrypts  the  collected  ID  data.  Alternative  Flows:  A1.  Export  Daily  Report.  
Receptionist  or  System  Manager  exports  a  daily  report  of  checked-in  guests  for  local  police  compliance.  


<!-- PAGE 106 -->



### 4.2.5  Check-Out
GAMS-SRS_v1.0   106 /143   

Exceptions:  E1.  Booking  not  confirmed.  
->System  rejects  the  check-in  attempt  (BR-12).  
E2.  Missing  ID  Data.  
->  System  alerts  the  receptionist  that  mandatory  ID  data  must  be  collected  before  finalizing  check-in.  
Priority:  High   
Frequency  of  Use:  High   
Business  Rules:  BR-12  ΓÇô  Check-in  Validation  
BR-13  ΓÇô  Villa  Occupancy  Update  
Other  Information:  
Must  comply  with  the  Law  on  Residence  2020  requiring  mandatory  temporary  residence  declaration.   
Assumptions:  Guests  bring  valid  domestic  or  foreign  identification  documents  upon  arrival.  
ID  and  Name:  UC-05  ΓÇô  Check-Out  
Primary  Actor:  Receptionist   Secondary  Actors:  Payment  Gateway  API  (Stripe  /  VNPay  Sandbox  /  PayPal)   
Description:  Allows  the  receptionist  to  process  guest  check-out,  generate  a  consolidated  invoice  (summing  up  remaining  package  costs,  extra  spa  services,  and  extra  F&B  orders),  and  update  the  villa  status.   
Trigger:  Guest  approaches  the  front  desk  to  conclude  their  stay.  
Preconditions:  Guest  is  currently  checked  into  a  villa.  
Receptionist  is  authenticated.  
Postconditions:  Guest  is  checked  out.  


<!-- PAGE 107 -->


### 4.2.6  Manage  Villa  Status
GAMS-SRS_v1.0   107 /143   

Final  invoice  is  paid.  
Villa  status  is  updated  to  Vacant/Needs  Cleaning.  
Normal  Flow:  1.  Receptionist  selects  the  guest's  folio  to  initiate  check-out.  2.  System  aggregates  data  using  the  Room_Booking  ID.  3.  System  generates  a  final  consolidated  invoice  during  check-out  (BR-15).  4.  System  validates  that  no  pending/unpaid  extra  orders  remain.  5.  Receptionist  processes  the  final  payment  via  the  Payment  Gateway  API.  6.  Receptionist  confirms  successful  payment  and  finalizes  check-out.  7.  System  updates  the  villa  status  to  "Vacant/Needs  Cleaning"  (BR-14).   Alternative  Flows:  
None   
Exceptions:  E1.  Pending/unpaid  extra  orders  exist.  
->System  blocks  the  check-out  process  due  to  the  Consolidated  Billing  Constraint.  
E2.  Payment  processing  fails.  
->System  alerts  the  receptionist  to  try  an  alternative  payment  method.  
Priority:  High   
Frequency  of  Use:  High   
Business  Rules:  BR-14  ΓÇô  Villa  Release  Update  
BR-15  ΓÇô  Invoice  Generation  
Other  Information:  
Follows  AHLEI  Standards  for  the  Guest  Folio  where  all  point-of-sale  systems  push  debts  to  a  central  account.   
Assumptions:  All  departments  (Spa,  F&B)  have  successfully  pushed  their  final  charges  to  the  guest  folio  prior  to  check-out.   
ID  and  Name:  UC-06  ΓÇô  Manage  Villa  Status  
Primary  Actor:  Receptionist   Secondary  Actors:  None   
Description:  Allows  the  receptionist  to  view  and  manage  physical  villa  statuses  (e.g.,  Available,  Occupied,  Maintenance)  during  the  guest  stay.   


<!-- PAGE 108 -->



### 4.2.7  View  Booking  Details
GAMS-SRS_v1.0   108 /143   

Trigger:  Receptionist  opens  the  Villa  Management  module.  
Preconditions:  Receptionist  is  authenticated.  
Postconditions:  Villa  statuses  reflect  their  real-world  condition  in  the  system.  
Normal  Flow:  1.  Receptionist  accesses  the  Villa  Management  dashboard.  2.  System  displays  all  physical  villas  and  their  current  statuses.  3.  Receptionist  selects  a  specific  villa  to  update  its  condition.  4.  Receptionist  submits  the  status  change  (e.g.,  changing  from  Maintenance  to  Available).  5.  System  saves  the  new  status.  Alternative  Flows:  A1.  System  Auto-Updates.  
->System  automatically  triggers  a  status  update  after  a  successful  check-in  (BR-13)  or  check-out  (BR-14).  
Exceptions:  E1.  Invalid  status  update.  
->System  prevents  logical  errors,  such  as  changing  an  Occupied  room  directly  to  Available  without  a  check-out  process.  
Priority:  Medium   
Frequency  of  Use:  High   
Business  Rules:  BR-13  ΓÇô  Villa  Occupancy  Update  
BR-14  ΓÇô  Villa  Release  Update  
Other  Information:  
None   
Assumptions:  The  housekeeping  and  maintenance  staff  accurately  communicate  physical  villa  conditions  to  the  receptionist.  
ID  and  Name:  UC07  ΓÇô  View  Booking  Details  


<!-- PAGE 109 -->


GAMS-SRS_v1.0   109 /143   

Primary  Actor:  Customer  /  Receptionist  /  Customer  Service  Staff   
Secondary  Actors:  System  (Database  Management  System)   
Description:  Allows  Customers  (or  authorized  resort  staff)  to  view  the  comprehensive  details  of  a  specific  reservation  or  wellness  retreat  package.  This  includes  accommodation  data,  payment  statuses,  personalized  wellness  itineraries  (e.g.,  yoga  schedules,  spa  therapies,  dietary  plans),  and  special  guest  requests.   
Trigger:  The  user  selects  a  specific  Booking  ID  from  their  booking  history  list  or  via  the  booking  search  bar.   Preconditions:  1.  The  user  has  successfully  logged  into  the  system  (or  the  staff  member  possesses  the  required  access  permissions  for  the  Booking  Module).  2.  The  target  booking  record  exists  within  the  system  database  (  Status   is  not  null/empty).  
Postconditions:  Complete  and  detailed  information  regarding  the  selected  booking  is  successfully  fetched  and  displayed  on  the  interface.   

Normal  Flow:  1.  The  user  clicks  on  the  specific  booking  ID  or  the  "View  Details"  button  within  the  Booking  List  view.  2.  The  system  captures  the  target  Booking  ID  and  sends  a  query  request  to  the  database  backend.  3.  The  system  executes  an  authorization  check  to  verify  access  rights  (ensuring  customers  can  only  view  their  own  reservations  while  authorized  staff  can  access  all  guest  bookings).  4.  The  system  retrieves  and  displays  the  following  detailed  sections  on  the  interface:  Γùï  General  Information:  Booking  ID,  creation  date,  and  current  booking  status  (e.g.,  Confirmed,  Paid,  Checked-In,  Completed).  Γùï  Accommodation  Details:  Villa/Room  type,  Check-in  date,  Check-out  date,  and  the  exact  count  of  adults/children.  Γùï  Personalized  Wellness  Itinerary:  Scheduled  time  slots  for  included  health  activities  (e.g.,  Yoga  sessions,  meditation  classes,  spa  therapies,  and  nutritional  consultations).  Γùï  Financial  Summary:  Total  cost,  deposit  amount  paid,  remaining  balance  due,  and  the  selected  payment  method.  5.  The  user  reviews  the  details  and  can  either  click  "Back"  to  return  to  the  list  or  proceed  with  secondary  actions  (e.g.,  Export  Receipt,  Cancel  Booking  -  if  within  the  eligible  cancellation  period).  



<!-- PAGE 110 -->


### 4.2.8  Book  Extra  Spa  Service
GAMS-SRS_v1.0   110 /143   

Alternative  Flows:  A1.  Direct  Staff  Search:  The  Receptionist  or  Customer  Service  staff  enters  a  Booking  ID  or  the  customer's  phone  number  directly  into  the  global  search  bar  to  jump  straight  to  this  details  page,  speeding  up  the  guest  check-in  workflow.   
Exceptions:  E1.  Booking  Record  Not  Found  
E2.  Unauthorized  Access   
Priority:  High   
Frequency  of  Use:  Multiple  times  daily  (whenever  guests  review  their  schedules  or  staff  perform  check-ins/check-outs)   
Business  Rules:  BR-11   
BR-12   
Other  Information:  
Dashboard  data  is  refreshed  automatically.   
Assumptions:  Room  availability  matrices  and  wellness  practitioner  schedules  are  fully  synchronized  and  accurate  at  the  time  of  viewing.   
ID  and  Name:  UC08  ΓÇô  Book  Extra  Spa  Service  
Primary  Actor:  Customer  /  Receptionist  /  Spa  Staff   
Secondary  Actors:  System  (Database  and  Notification  Engine)   
Description:  Allows  currently  checked-in  guests  (or  resort  staff  acting  on  their  behalf)  to  browse,  select,  and  book  additional  custom  spa  therapies  or  wellness  sessions  that  were  not  included  in  their  initial  retreat  package.   
Trigger:  The  actor  selects  the  "Book  Extra  Spa  Service"  option  on  the  guest  application  or  the  internal  property  management  portal.   Preconditions:  1.  The  user  has  logged  into  the  system.  2.  [BR-16]  The  booking  status  associated  with  the  customer  must  be  active  and  marked  as  "Checked-In"  (Status  =  'Occupied').  3.  [BR-07]  The  guest  must  have  a  completed,  valid  wellness  health  profile  on  record.  
Postconditions:  1.  The  extra  spa  service  session  is  successfully  scheduled  and  reserved.  


<!-- PAGE 111 -->


GAMS-SRS_v1.0   111 /143   

## 2.  The  resortΓÇÖs  resource  allocation  logs  (therapist  schedule  and  treatment  room  availability)  are  locked  for  that  time  frame.  3.  The  extra  service  cost  is  appended  to  the  customerΓÇÖs  pending  room  bill/invoice.  4.  The  resortΓÇÖs  resource  allocation  logs  (therapist  schedule  and  treatment  room  availability)  are  locked  for  that  time  frame.  5.  The  extra  service  cost  is  appended  to  the  customerΓÇÖs  pending  room  bill/invoice.
Normal  Flow:  1.  The  user  navigates  to  the  Extra  Services  section  and  selects  "Spa  Treatments" .  2.  The  system  dynamically  pulls  and  presents  a  list  of  all  currently  active  extra  spa  services,  along  with  their  duration,  targeted  physical  benefits,  and  extra  pricing  details.  3.  The  user  picks  a  specific  therapy  (e.g.,  Deep  Tissue  Aromatherapy  Massage )  and  selects  a  desired  date  and  time  slot.  4.  The  system  validates  the  availability  of  resources  for  the  chosen  time  slot:  a.  [BR-08]  Checks  for  an  available,  unassigned  Therapist  with  corresponding  certifications.  b.  [BR-09]  Checks  for  a  vacant  treatment  or  Therapy  Room.  5.  The  system  displays  a  confirmation  summary  outlining  the  service  name,  duration,  assigned  room,  final  price,  and  the  notice  that  this  fee  will  be  settled  upon  check-out.  6.  The  user  clicks  "Confirm  Booking" .  7.  The  system  registers  the  appointment,  updates  room  and  therapist  schedules,  links  the  bill  item  to  the  guest's  main  transaction  invoice,  and  renders  a  booking  confirmation  message.  
  Alternative  Flows:  A1.  Staff  Booking  for  Guest:  If  a  guest  approaches  the  front  desk  or  calls  the  spa  reception,  the  staff  logs  into  the  dashboard,  retrieves  the  guest's  profile  using  their  villa  number,  verifies  their  checked-in  status,  and  schedules  the  service  on  behalf  of  the  customer.   
Exceptions:   
Priority:  High   
Frequency  of  Use:  Multiple  times  daily.   
Business  Rules:  BR-16  
BR-07  


<!-- PAGE 112 -->



### 4.2.9  View  Arrivals  Dashboard
GAMS-SRS_v1.0   112 /143   

BR-08  
BR-09  
Other  Information:  
Once  confirmed,  the  newly  scheduled  spa  session  is  automatically  synchronized  and  appended  to  the  updated  Wellness  Itinerary  inside  UC07  (View  Booking  Details).   Assumptions:  All  extra  spa  services,  practitioner  availability  tables,  and  pricing  configurations  are  maintained  and  kept  up-to-date  by  the  administration  team.   
ID  and  Name:  UC09  ΓÇô  View  Arrivals  Dashboard   
Primary  Actor:  Receptionist  /  Resort  Manager   
Secondary  Actor:  System   
Description:  Allows  receptionists  and  managers  to  view  a  real-time  list  of  guests  scheduled  to  arrive  and  check  in  on  the  current  date,  complete  with  their  assigned  room  status,  health  tracking  indicators,  and  booking  summary.   
Trigger:  The  staff  member  navigates  to  the  Arrivals  and  Check-In  tab  on  the  internal  dashboard.   Preconditions:  1.  Staff  member  is  logged  into  the  management  system.  
## 2.  The  staff  member  has  a  role  with  authorized  access  to  the  reception  module.

Postconditions:  The  arrivals  dashboard  displays  a  consolidated,  real-time  list  of  expected  check-ins  for  the  current  date.   

Normal  Flow:  1.  Staff  member  opens  the  Arrivals  Dashboard  screen.  2.  System  identifies  the  current  date  parameters.  3.  System  fetches  all  active  bookings  with  a  check-in  date  matching  the  current  date.  4.  System  retrieves  corresponding  room  status  logs,  package  data,  and  profile  flags  from  the  database.  5.  System  renders  the  arrivals  queue,  displaying  guest  names,  scheduled  arrival  times,  assigned  villa  numbers,  package  names,  and  payment  confirmation  status.  


<!-- PAGE 113 -->



### 4.2.10  Order  Extra  F&B  Items
GAMS-SRS_v1.0   113 /143   

## 6.  System  checks  for  critical  health  indicators  (such  as  extreme  food  allergies  or  medical  history  markers)  and  appends  a  visual  alert  symbol  next  to  relevant  guest  records.  7.  Staff  member  reviews  the  real-time  grid  to  prepare  check-in  keys,  physical  registration  slips,  and  coordinate  with  the  spa  or  kitchen  teams.
  Alternative  Flows:  A1.  Filter  and  sort  queue:  Staff  member  filters  the  arrival  grid  by  specific  package  types,  villa  blocks,  or  sorts  the  entries  by  estimated  check-in  times.  
A2.  Search  function:  Staff  member  types  a  customer  name  or  confirmation  code  into  the  local  grid  filter  box  to  instantly  isolate  a  single  arrival  entry.   
Exceptions:  E1.  No  arrivals  scheduled:  If  there  are  zero  reservations  booked  for  the  current  check-in  date,  the  system  displays  a  placeholder  notice:  "No  guest  arrivals  scheduled  for  today."   
E2.  Real-time  data  sync  failure:  If  connection  to  the  database  or  internal  socket  layer  is  lost,  the  system  blocks  the  auto-refresh  mechanism,  retains  the  last  cached  view,  and  presents  a  non-disruptive  offline  notification  banner.   
 Priority:  High   
Frequency  of  Use:  Continuous  operation  throughout  daily  operational  shifts.   
Business  Rules:  BR-21  
BR-12   
BR-29  
Other  Information:  
Selecting  any  individual  line  item  from  this  arrival  grid  will  redirect  the  internal  system  interface  straight  into  the  respective  user  profile  or  check-in  execution  module.   Assumptions:  Expected  guests  have  completed  their  base  profile  generation,  financial  deposits,  or  travel  itinerary  declarations  during  the  pre-arrival  stage.   
ID  and  Name:  UC10  ΓÇô  Order  Extra  F&B  Items   
Primary  Actor:  Customer  /  F&B  Staff  /  Receptionist   
Secondary  Actor:               System   


<!-- PAGE 114 -->


GAMS-SRS_v1.0   114 /143   

Description:  Allows  currently  checked-in  guests  or  resort  staff  to  order  additional  food,  drinks,  or  premium  wellness  snacks  that  are  outside  the  pre-configured  nutritional  selections  of  their  main  retreat  package.   
Trigger:  1.  User  is  logged  into  the  system.  2.  The  associated  booking  status  must  be  checked-in  (Villa  status  is  Occupied).   Preconditions:  1.Staff  is  logged  into  the  system.  
2.Daily  meal  orders  exist.  
Postconditions:  1.The  additional  food  and  beverage  order  is  registered  and  sent  to  the  kitchen  dashboard.  
2.The  order  cost  is  calculated  and  appended  to  the  customer's  pending  invoice.  
Normal  Flow:  1.  User  navigates  to  the  Extra  Services  section  and  selects  F&B  Menu.  2.  System  retrieves  and  displays  a  list  of  active  premium  food  and  beverage  items  with  real-time  pricing.  3.  User  selects  the  desired  items,  configures  quantities,  and  adds  them  to  the  cart.  4.  User  selects  a  preferred  delivery  time  slot  and  enters  any  special  instructions.  5.  System  checks  the  guest's  profile  for  food  allergy  warnings.  6.  System  displays  an  order  summary  including  quantities,  item  costs,  delivery  villa  number,  and  allergy  risk  confirmations.  7.  User  clicks  Confirm  Order.  8.  System  registers  the  order  transaction,  pushes  the  item  request  to  the  kitchen  prep  dashboard,  updates  the  guest's  pending  invoice,  and  shows  a  success  confirmation  message.  
  Alternative  Flows:  A1.  Staff  ordering  for  guest:  F&B  Staff  or  Receptionist  takes  an  order  via  a  villa  phone  call,  searches  for  the  guest  record  by  villa  number,  and  completes  the  items  checkout  steps  on  behalf  of  the  customer.   


<!-- PAGE 115 -->



### 4.2.11  Complete  Dietary  &  Health  Profile
GAMS-SRS_v1.0   115 /143   

Exceptions:  E1.  Guest  not  checked-in:  If  the  booking  status  is  not  checked-in,  the  system  blocks  the  flow  and  displays  an  error  message:  "Extra  food  and  beverage  orders  are  reserved  exclusively  for  checked-in  guests."  
 E2.  Menu  item  unavailable:  If  a  selected  item  goes  out  of  stock  at  the  moment  of  completion,  the  system  halts  the  transaction,  alerts  the  user,  and  asks  them  to  remove  or  modify  the  choice.   
Priority:  High   
Frequency  of  Use:   
Multiple  times  daily.   
Business  Rules:  BR-11  
BR-16   
Other  Information:  
Once  confirmed,  the  transaction  metadata  is  logged  and  linked  to  the  updated  billing  summaries  inside  UC07  (View  Booking  Details).   
Assumptions:  Menu  prices,  active  ingredient  flags,  and  kitchen  operating  timetables  are  maintained  accurately  by  the  restaurant  management  team.   
ID  and  Name:  UC11  ΓÇô  Complete  Dietary  &  Health  Profile   
Primary  Actor:  Customer  /  Receptionist   Secondary  Actor  :  System   
Description:  Allows  customers  or  receptionists  to  input  and  update  critical  personal  health  records,  physical  preconditions,  medical  history,  and  specific  food  allergies  to  customize  their  wellness  retreat  package.   
Trigger:  The  user  accesses  the  "Health  Declaration"  or  "Dietary  &  Health  Profile"  setup  wizard.   Preconditions:  1.  User  is  logged  into  the  system.  2.  The  user  profile  record  exists  in  the  system  base  tables.  
Postconditions:  1.  The  dietary  requirements  and  health  profile  details  are  securely  stored.  2.  Sensitive  fields  are  automatically  masked  or  encrypted  at  rest  in  the  database  layer.  3.  Overarching  cross-module  eligibility  flags  are  set  to  active.  


<!-- PAGE 116 -->


GAMS-SRS_v1.0   116 /143   


Normal  Flow:  1.  User  navigates  to  the  Health  Declaration  section.  2.  System  displays  a  standardized  wellness  medical  and  dietary  questionnaire  form.  3.  User  inputs  health  history,  existing  medical  concerns,  body  parameters,  and  checks  relevant  food  allergy  tags.  4.  User  clicks  Submit  Profile.  5.  System  captures  the  raw  parameters  and  filters  out  data  groups  based  on  authorization  criteria.  6.  System  applies  encryption  methods  on  health  descriptors  and  critical  allergy  strings  before  database  communication.  7.  System  saves  the  record  successfully,  binds  the  unique  profile  key  to  the  user  account,  and  outputs  a  registration  success  prompt.  
  Alternative  Flows:  A1.  Staff  registration  for  guest:  A  Receptionist  collects  handwritten  physical  medical  forms  from  a  checking-in  guest  and  manually  populates  the  input  parameters  into  the  internal  workspace  on  behalf  of  the  customer.   
Exceptions:  E1.  Mandatory  field  omission:  If  primary  physical  health  fields  or  allergy  declarations  are  left  empty,  the  system  stops  the  transaction,  alerts  the  input  window,  and  borders  uncompleted  fields  in  red.    
E2.  Data  corruption  or  decryption  drop:  If  the  security  configuration  layer  cannot  execute  proper  masking  protocols  on  the  inputted  text  block,  the  system  terminates  the  submission,  rejects  the  database  commit,  and  provides  an  application  fault  alert.   
 Priority:  High   
Frequency  of  Use:  Typically  performed  once  per  guest  lifecycle,  with  occasional  revisions  before  new  retreat  bookings.   
Business  Rules:  BR-11   
BR-7  
BR-20  
Other  Information:  
All  saved  criteria  seamlessly  link  to  internal  system  trackers,  providing  real-time  data  lookups  for  the  kitchen  prep  platform  and  the  therapist  resource  allocation  matrix.   Assumptions:  Guests  provide  true,  up-to-date  health  information  to  optimize  their  on-site  safety  configurations  and  meal  preparation  criteria.   


<!-- PAGE 117 -->



### 4.2.12  Schedule  Spa  Therapy  Session
GAMS-SRS_v1.0   117 /143   

ID  and  Name:  UC12  ΓÇô  Schedule  Spa  Therapy  Session  
Primary  Actor:  Customer  /  Receptionist  /  Spa  Staff   
Secondary  Actor:   System  
Description:  Allows  customers  or  resort  staff  to  schedule  specific  dates  and  time  slots  for  spa  therapies  and  wellness  treatments  included  in  their  main  retreat  packages  or  booked  as  standalone  extra  services.   
Trigger:  The  user  selects  a  therapy  item  from  their  package  itinerary  or  confirmed  extra  order  and  clicks  "Schedule  Session".  
Preconditions:  1.User  is  logged  into  the  system.  
2.An  active  booking  record  exists  for  the  customer.  
3.The  guest  has  completely  filled  out  their  health  profile  (UC11).  

Postconditions:  1.The  spa  therapy  session  is  booked,  scheduled,  and  allocated  a  status  of  "Scheduled".  
2.The  selected  therapist  and  therapy  room  calendars  are  locked  for  the  duration  of  the  treatment  session.  
3.The  session  schedule  is  updated  in  the  master  booking  itinerary.  
Normal  Flow:   
## 1.  User  accesses  the  scheduling  manager  from  their  master  itinerary  view.  2.  System  retrieves  the  list  of  treatments  eligible  for  scheduling  linked  to  the  customer  booking.  3.  User  selects  a  specific  treatment  session  to  plan.  4.  System  queries  the  database  and  displays  available  open  calendar  blocks,  available  certified  therapists,  and  vacant  therapy  rooms.  5.  User  selects  a  preferred  date  and  time  slot.  6.  System  checks  cross-module  operational  rules  to  ensure  the  selected  time  falls  precisely  within  the  check-in  and  check-out  dates  (BR-30).


<!-- PAGE 118 -->


GAMS-SRS_v1.0   118 /143   

## 7.  System  reviews  the  master  resource  matrix  to  ensure  the  slot  does  not  conflict  with  other  scheduled  sessions  for  that  therapist  or  room  (BR-08,  BR-09).  8.  System  displays  a  scheduling  summary  preview  including  date,  time,  therapy  name,  assigned  room,  and  therapist  initials.  9.  User  clicks  Confirm  Schedule.  10.  System  commits  the  appointment  block  to  the  database,  sends  an  automated  reminder  notification  via  the  calendar  worker,  updates  the  resource  schedules,  and  renders  a  booking  confirmation  prompt.
  Alternative  Flows:  A1.  Staff  scheduling  adjustment:  Spa  Staff  or  a  Receptionist  searches  for  a  guest  record  via  their  assigned  villa  number,  opens  their  current  wellness  calendar  layout,  and  executes  or  shifts  a  treatment  appointment  slot  on  behalf  of  the  customer.    
Exceptions:  E1.  Missing  health  profile:  If  the  system  detects  that  the  required  health  declaration  fields  or  underlying  medical  constraints  are  absent,  the  system  halts  scheduling  and  warns  the  user:  "Please  complete  your  health  profile  questionnaire  before  scheduling  therapy  sessions."   
E2.  Resource  concurrency  conflict:  If  another  user  locks  the  same  therapist  or  treatment  room  concurrently  right  before  submission,  the  database  validation  layer  rejects  the  commit,  alerts  the  scheduling  view,  and  prompts  the  user  to  choose  an  alternative  open  time  block.   
E3.  Out-of-bounds  scheduling  timeframe:  If  the  chosen  session  time  resides  outside  the  formal  booking  arrival  or  departure  dates,  the  validation  script  blocks  confirmation  and  displays  a  timeline  constraint  exception  error.   
 Priority:  High   
Frequency  of  Use:  Multiple  times  daily.   
Business  Rules:  BR-07  
BR-30  
BR-08  
BR-09  
Other  Information:  
Once  completed,  the  newly  locked  calendar  timestamp  instantly  maps  to  the  master  display  interface  within  UC07  (View  Booking  Details).   


<!-- PAGE 119 -->



### 4.2.13  Book  Retreat  Package
ID  and  Name:  UC-13  ΓÇô  Book  Retreat  Package    
Primary  Actor:  Customer   Secondary  Actors:  Payment  Gateway  System    
Description:  This  use  case  allows  a  customer  to  book  a  retreat  package  and  make  the  required  deposit  payment  to  confirm  the  reservation.    Trigger:  Customer  selects  a  retreat  package  and  clicks  "Book  Now".   
Preconditions:  1.  Customer  account  exists  and  is  authenticated.  2.  Retreat  package  is  available.  3.  Selected  dates  have  available  villas.  
Postconditions:  1.  Booking  record  is  created.  
## 2.  Deposit  payment  is  successfully  recorded.
## 3.  Booking  confirmation  is  generated.
Normal  Flow:  1.  Customer  browses  retreat  packages.  2.  System  displays  active  packages  only  (BR-04).  3.  Customer  selects  a  package.  4.  Customer  selects  arrival  and  departure  dates.  5.  System  validates  villa  availability  (BR-06).  6.  Customer  confirms  booking  information.  7.  System  calculates  required  deposit.  8.  Customer  submits  payment.  9.  Payment  gateway  processes  transaction.  10.  System  receives  payment  confirmation.  11.  System  confirms  booking  according  to  deposit  requirements  (BR-05).  12.  System  displays  booking  confirmation.  Alternative  Flows:  A1.  Customer  chooses  another  package   ΓåÆ  System  displays  selected  package  details.  
A2.  Customer  changes  booking  dates   ΓåÆ  System  rechecks  availability.  
Exceptions:  E1.  Selected  package  is  inactive.  ΓåÆ  System  rejects  booking.  
GAMS-SRS_v1.0   119 /143   

Assumptions:  Staff  shifts,  room  maintenance  slots,  and  practitioner  availability  tables  are  kept  fully  synchronized  and  correct  within  the  administration  configuration  panel.   


<!-- PAGE 120 -->


E2.  Villa  unavailable.  ΓåÆ  System  requests  another  selection.  
E3.  Deposit  payment  fails.  ΓåÆ  Booking  remains  Pending.  
 Priority:  High  
Frequency  of  Use:  High    
Business  Rules:  BR-04  ΓÇô  Active  Package  Availability.   
BR-05  ΓÇô  Deposit  Requirement.   
BR-06  ΓÇô  Villa  Availability  Validation.   
BR-30  ΓÇô  Booking  Timeline  Consistency.   
Other  Information:  Deposit  percentage  is  configurable  by  resort  management   Payment  processing  is  handled  through  an  external  payment  gateway.  Booking  confirmation  email  is  automatically  generated  after  successful  payment  Assumptions:  Customer  provides  accurate  booking  information.   
### 4.2.14  View  Booking  Details
ID  and  Name:  UC-14  ΓÇô  View  Booking  Details   
Primary  Actor:  Customer   Secondary  Actors:  System  Administrator   
Description:  Allows  customers  to  view  booking  details  and  itinerary  information.   
Trigger:  Customer  selects  "My  Booking"  after  successful  authentication.   
Preconditions:  1.  Customer  is  authenticated.  2.  Booking  record  exists.  
Postconditions:  1.  Booking  details  are  displayed.   
Normal  Flow:  1.  Customer  opens  booking  details.  2.  System  retrieves  booking  information.  3.  System  retrieves  itinerary  schedule.  4.  System  validates  timeline  consistency  (BR-30).  5.  System  displays  booking  details.  6.  System  displays  itinerary  timeline.   
GAMS-SRS_v1.0   120 /143   



<!-- PAGE 121 -->


Alternative  Flows:  A1.  Multiple  bookings  exist  
ΓåÆ  System  displays  booking  list.   
Exceptions:  E1.  Booking  not  found  
ΓåÆ  System  displays  error  message.   
 Priority:  Medium   
Frequency  of  Use:  High  
Business  Rules:  BR-30  ΓÇô  Booking  Timeline  Consistency   
Other  Information:  Booking  timeline  includes  accommodation,  meals,  spa  sessions,  and  yoga  activities.  Information  displayed  is  read-only.  Assumptions:  Booking  information  is  available.   
### 4.2.15  Manage  Profile
ID  and  Name:  UC-15  ΓÇô  Manage  Profile   
Primary  Actor:  Customer   Secondary  Actors:  System  Administrator   
Description:  This  use  case  allows  customers  to  manage  personal  profile  information  and  request  deletion  of  sensitive  personal  data.  .   Trigger:  Customer  selects  "Profile  Settings"  after  successful  authentication.   
Preconditions:  1.  Customer   account  exists  and  is  authenticated.  2.  Customer   account  status  is  Active..  
Postconditions:  1.  Profile  information  is  updated.  
## 2.  Sensitive  data  deletion  request  is  recorded  if  submitted.
Normal  Flow:  1.  Customer  opens  profile  page.  2.  System  displays  current  profile  information.  3.  Customer  edits  profile  data.  4.  Customer  submits  changes.  5.  System  validates  information.  6.  System  updates  profile.  7.  Customer  optionally  requests  sensitive  data  deletion.  8.  System  records  deletion  request  (BR-20).  9.  System  displays  confirmation.  
GAMS-SRS_v1.0   121 /143   



<!-- PAGE 122 -->


Alternative  Flows:  A1.  Customer  updates  profile  only  
ΓåÆ  Deletion  request  process  is  skipped.   
Exceptions:  E1.  Invalid  data  
ΓåÆ  System  rejects  update  and  displays  validation  message.   
 Priority:  Medium   
Frequency  of  Use:  Medium   
Business  Rules:  BR-20  ΓÇô  Sensitive  Data  Deletion   
Other  Information:  Personal  information  is  protected  according  to  privacy  regulations.  Sensitive  data  deletion  requests  may  require  administrative  review.  Assumptions:  Customer  provides  accurate  information.   
### 4.2.16  Pre-select  Daily  Meals
ID  and  Name:  UC-16  ΓÇô  Pre-select  Daily  Meals   
Primary  Actor:  Customer   Secondary  Actors:  Chef  /  F&B  Staff   
Description:  This  use  case  allows  customers  to  select  meals  before  their  stay.   
Trigger:  Customer  opens  Daily  Meal  Planner.   
Preconditions:  1.  Customer  has  a  confirmed  booking.   
Postconditions:  1.  Meal  selections  are  saved.  
## 2.  Kitchen  staff  can  access  meal  information.
Normal  Flow:  1.  Customer  opens  meal  planner.  2.  System  displays  available  meals.  3.  System  retrieves  dietary  profile.  4.  Customer  selects  meals.  5.  System  displays  allergy  warnings  (BR-11).  6.  Customer  submits  meal  selections.  7.  System  validates  cutoff  time  (BR-10).  8.  System  stores  meal  selections.  9.  System  updates  meal  preparation  dashboard.  
GAMS-SRS_v1.0   122 /143   



<!-- PAGE 123 -->


Alternative  Flows:  A1.  Customer  updates  meal  choices  before  deadline  
ΓåÆ  System  updates  meal  plan.   
Exceptions:  E1.  Submission  after  cut  off  time  
ΓåÆ  System  rejects  submission.   
 Priority:  Medium   
Frequency  of  Use:  High   
Business  Rules:  BR-10  ΓÇô  Meal  Selection  Deadline  
BR-11  ΓÇô  Allergy  Warning  
BR-30  ΓÇô  Booking  Timeline  Consistency  
Other  Information:  Meal  availability  may  vary  based  on  seasonal  menus.  Dietary  preferences  are  considered  during  meal  preparation.  Assumptions:  Meal  options  are  available.   
### 4.2.17  Submit  Review  &  Rating
ID  and  Name:  UC-17  ΓÇô  Submit  Review  &  Rating    
Primary  Actor:  Customer   Secondary  Actors:  Business  Manager   
Description:  This  use  case  allows  customers  to  submit  reviews  and  ratings  after  completing  their  stay.   Trigger:  Customer  selects  "Submit  Review"   after  successful  authentication.   
Preconditions:  1.  Customer  completed  stay  (BR-18).  2.  No  review  exists  for  the  booking  (BR-19).  
Postconditions:  1.  Review  is  stored.  
## 2.  Review  becomes  available  for  management  review.
Normal  Flow:  1.  Customer  opens  review  form.  2.  System  verifies  booking  completion.  3.  System  verifies  review  eligibility  (BR-18).  4.  System  verifies  no  previous  review  exists  (BR-19).  5.  Customer  enters  rating.  
GAMS-SRS_v1.0   123 /143   



<!-- PAGE 124 -->


## 6.  Customer  enters  comments.  7.  Customer  submits  review.  8.  System  validates  review.  9.  System  stores  review.  10.  System  displays  confirmation.  Alternative  Flows:              A1.  Customer  edits  review  before  submission
            ΓåÆ  System  updates  review  content.   
Exceptions:              E1.  Stay  not  completed            ΓåÆ  Review  submission  is  rejected.  
            E2.  Review  already  exists            ΓåÆ  Duplicate  review  is  rejected.  
Priority:  Medium   
Frequency  of  Use:  Medium   
Business  Rules:  BR-18  ΓÇô  Review  Eligibility  
BR-19  ΓÇô  Single  Review  Per  Booking  
Other  Information:  Reviews  may  be  displayed  publicly  after  moderation.  Ratings  contribute  to  service  quality  analysis.  Assumptions:  Review  content  follows  resort  guidelines.   
### 4.2.18  View  Daily  Schedule
ID  and  Name:  UC-18  ΓÇô  View  Daily  Schedule   
Primary  Actor:  Spa  Therapist  /  Yoga  Instructor   
Secondary  Actors:  System  Administrator   
Description:  This  use  case  allows  therapists  and  instructors  to  view  daily  schedules  and  guest  health  notes.   Trigger:  Staff  member  opens  Daily  Schedule.    
Preconditions:  1.  Staff  account  is  authenticated.  2.  Staff  account  has  proper  role  permissions  (BR-21).  
Postconditions:  1.  Daily  schedule  is  displayed.   
Normal  Flow:  1.  Therapist  logs  into  the  system.  2.  Therapist  opens  Daily  Schedule.  
GAMS-SRS_v1.0   124 /143   



<!-- PAGE 125 -->


## 3.  System  retrieves  assigned  sessions.  4.  System  retrieves  related  guest  health  notes.  5.  System  displays  schedule  information.  6.  System  displays  therapist  assignments  validated  by  availability  rules  (BR-08).   Alternative  Flows:          A1.  No  assigned  sessions
       ΓåÆ  System  displays  empty  schedule.   
Exceptions:          E1.  Unauthorized  access  
        ΓåÆ  System  denies  access.   
 Priority:  High  
Frequency  of  Use:  High   
Business  Rules:  BR-08  ΓÇô  Therapist  Availability  
BR-21  ΓÇô  Role-Based  Access  Control  
Other  Information:  Guest  health  notes  displayed  are  limited  to  information  required  for  service  delivery.  Schedule  information  is  updated  in  real  time.  Assumptions:  Schedules  are  generated  in  advance.  
### 4.2.19  Update  Session  Status
ID  and  Name:  UC-19  ΓÇô  Update  Session  Status   
Primary  Actor:  Spa  Therapist  /  Yoga  Instructor   
Secondary  Actors:  System  Administrator   
Description:  This  use  case  allows  therapists  and  instructors  to  update  session  status.   
Trigger:  Therapist  selects  a  scheduled  session.    
Preconditions:  1.  Therapist  is  authenticated.  2.  Session  exists.  3.  Therapist  is  assigned  to  the  session.  
Postconditions:  1.  Session  status  is  updated.   
Normal  Flow:  1.Therapist  opens  daily  schedule.  
GAMS-SRS_v1.0   125 /143   



<!-- PAGE 126 -->


2.Therapist  selects  a  session.  3.System  displays  session  information.  4.Therapist  updates  status:  
Scheduled  
In  Progress  
Completed  
No  Show  
5.Therapist  submits  update.  6.System  validates  assignment.  7.System  updates  session  status.  8.System  records  status  history.  9.System  displays  confirmation.  .  Alternative  Flows:  A1.  Session  marked  No  Show  
           ΓåÆ  System  records  attendance  exception.   
Exceptions:  E1.  Therapist  not  assigned  
            ΓåÆ  System  rejects  update.   
Priority:  High  
Frequency  of  Use:  High    
Business  Rules:  BR-17  ΓÇô  Session  Status  Update  
BR-21  ΓÇô  Role-Based  Access  Control  
Other  Information:  Session  history  is  retained  for  operational  reporting  and  auditing.  Status  changes  may  trigger  notifications  to  related  departments.  Assumptions:  Assigned  therapists  are  responsible  for  status  updates.   

### 4.2.20  View  Daily  Meal  Prep  Dashboard
GAMS-SRS_v1.0   126 /143   

ID  and  Name:  UC20  ΓÇô  View  Daily  Meal  Prep  Dashboard   
Primary  Actor:  Chef  /  F&B  Staff   Secondary  Actors:  System  
Description:  Allows  kitchen  staff  to  view  daily  meal  preparation  schedules  and  customer  food  allergy  warnings.   


<!-- PAGE 127 -->


### 4.2.21  Update  Meal  Order  Status
GAMS-SRS_v1.0   127 /143   

Trigger:  The  staff  selects  "Daily  Meal  Prep  Dashboard"   
Preconditions:  1.Staff  is  logged  into  the  system.  
2.Daily  meal  orders  exist.  
Postconditions:  1.Daily  meal  information  is  displayed.  
2.Allergy  warnings  are  visible  to  staff.  
Normal  Flow:  1.Staff  opens  the  Daily  Meal  Prep  Dashboard.  2.System  retrieves  all  meal  orders  for  the  selected  date.  3.System  displays  customer  names,  meal  selections,  and  delivery  times.  4.System  highlights  food  allergy  warnings.  5.Staff  reviews  meal  preparation  requirements.   Alternative  Flows:  A1.  Staff  filters  meal  orders  by  meal  type  or  delivery  time.  
A2.  Staff  searches  for  a  specific  customer  order.   
Exceptions:   E1.  No  meal  orders  exist  for  the  selected  date.  
E2.  System  cannot  retrieve  meal  data.   
 Priority:  High   
Frequency  of  Use:  Multiple  times  daily.   
Business  Rules:  BR-11   
BR-12   
Other  Information:  Dashboard  data  is  refreshed  automatically.   
Assumptions:  Meal  selections  have  been  submitted  by  customers.   
ID  and  Name:  UC21  ΓÇô  Update  Meal  Order  Status  
Primary  Actor:  Chef  /  F&B  Staff   Secondary  Actors:  System  


<!-- PAGE 128 -->


### 4.2.22  Manage  Staff  Accounts  &  Roles
GAMS-SRS_v1.0   128 /143   

Description:  Allows  staff  to  update  meal  order  status  during  preparation  and  delivery.   
Trigger:  Staff  selects  a  meal  order  to  update.   
Preconditions:  1.Staff  is  logged  in.  
2.Meal  order  exists.  
Postconditions:  Meal  order  status  is  updated.  
Normal  Flow:  1.Staff  opens  the  meal  order  list.  2.Staff  selects  an  order.  3.Staff  changes  status  to  "Preparing"  or  "Ready  for  Delivery".  4.System  validates  the  update.  5.System  saves  the  new  status.  6.System  displays  a  confirmation  message.    Alternative  Flows:  A1.  Staff  updates  multiple  orders  at  once.   
Exceptions:  E1.  Selected  order  no  longer  exists.  
E2.  System  fails  to  save  changes.   
 Priority:  High   
Frequency  of  Use:  Multiple  times  daily.   
Business  Rules:  BR-21  
Other  Information:  
Status  updates  are  reflected  immediately.   
Assumptions:  Only  authorized  staff  can  modify  meal  orders.   
ID  and  Name:  UC22  ΓÇô  Manage  Staff  Accounts  &  Roles  
Primary  Actor:  Admin   Secondary  Actors:  System  


<!-- PAGE 129 -->


### 4.2.23  Manage  Villa  &  Room  Master  Data
GAMS-SRS_v1.0   129 /143   

Description:  Allows  administrators  to  create  staff  accounts,  lock/unlock  accounts,  and  assign  roles.   
Trigger:  Admin  selects  "Manage  Staff  Accounts".   
Preconditions:  1.Admin  is  authenticated.  
2.Admin  has  account  management  permission.  
Postconditions:  Staff  account  information  is  updated.   
Normal  Flow:  1.Admin  accesses  account  management.  2.Admin  creates,  edits,  locks,  unlocks,  or  assigns  a  role.  3.System  validates  the  request.  4.System  updates  account  information.  5.System  records  the  action.   Alternative  Flows:  A1.  Admin  resets  a  staff  password.   
Exceptions:  E1.  Duplicate  email  detected.  
E2.  Invalid  role  assignment.  
E3.  System  update  failure.   
 Priority:  High   
Frequency  of  Use:   Weekly  or  as  needed   
Business  Rules:  BR-21   
BR-22   
   Other    Information:  
All  account  actions  are  logged.   
Assumptions:  Only  Admin  users  can  access  this  function.   
ID  and  Name:  UC23  ΓÇô  Manage  Villa  &  Room  Master  Data  


<!-- PAGE 130 -->


GAMS-SRS_v1.0   130 /143   

Primary  Actor:  Admin   
Secondary  Actors:  System  
Description:  Allows  administrators  to  manage  villa  information,  room  information,  and  room  categories.  
Trigger:  Admin  selects  "Villa  &  Room  Management".  
Preconditions:  1.Admin  is  logged  in.  
2.Admin  has  management  permission.  
Postconditions:  Villa  or  room  data  is  updated  successfully.  
Normal  Flow:  1.  Admin  accesses  Villa  &  Room  Management.  2.System  displays  existing  villas  and  room  categories.  3.  Admin  adds,  edits,  or  deletes  data  4.  System  validates  the  information.  5.  System  saves  the  changes.  6.System  confirms  successful  completion.    Alternative  Flows:  A1.  Admin  updates  room  category  information.  
A2.  Admin  modifies  villa  details.   
Exceptions:  E1.  Required  fields  are  missing.  
E2.  Duplicate  room  category  exists.  
E3.  Database  update  fails.   
 Priority:  High   
Frequency  of  Use:  Weekly   
Business  Rules:  BR-21  
Other  Information:  Changes  affect  future  bookings.  
Assumptions:  No  active  booking  depends  on  deleted  data.  


<!-- PAGE 131 -->


### 4.2.24  Manage  Resort  &  Yoga  Services  Master  Data
GAMS-SRS_v1.0   131 /143   

ID  and  Name:  UC24  ΓÇô  Manage  Resort  &  Yoga  Services  Master  Data  
Primary  Actor:  Admin   Secondary  Actors:   
Description:  Allows  administrators  to  add,  update,  deactivate,  or  suspend  resort  and  yoga  services.  
Trigger:  Admin  selects  "Service  Management".  
Preconditions:  1.Admin  is  authenticated.  
2.Service  records  exist  or  can  be  created.  
Postconditions:  Service  information  is  updated.  
Normal  Flow:  1.Admin  opens  Service  Management.  2.System  displays  service  records.  3.Admin  creates,  updates,  deactivates,  or  suspends  a  service.  4.System  validates  the  request.  5.System  saves  the  changes.  6.System  displays  confirmation.    Alternative  Flows:  A1.  Admin  views  service  details  before  updating.   
Exceptions:   As  needed   
Priority:  High   
Frequency  of  Use:  Multiple  times  daily.   
Business  Rules:  BR-21  
BR-23  
Other  Information:  Inactive  services  cannot  be  booked.  


<!-- PAGE 132 -->


### 4.2.25  Manage  Retreat  Packages  Master  Data
GAMS-SRS_v1.0   132 /143   

Assumptions:  Services  are  categorized  properly.  
ID  and  Name:  UC25  ΓÇô  Manage  Retreat  Packages  Master  Data  
Primary  Actor:  Admin   Secondary  Actors:   
Description:  Allows  administrators  to  create,  update,  activate,  or  deactivate  retreat  packages.  
Trigger:  Admin  selects  "Retreat  Package  Management".  
Preconditions:  1.Admin  is  logged  in.  
2.Package  management  permission  is  granted.  
Postconditions:  Package  information  is  updated  successfully.  
Normal  Flow:  1.Admin  accesses  package  management.  2.System  displays  package  records.  3.Admin  creates  or  edits  package  information.  4.System  validates  the  package.  5.System  saves  changes.  6.System  confirms  successful  update.    Alternative  Flows:  A1.  Admin  deactivates  a  package.   
Exceptions:  E1.  Missing  required  package  information.  
E2.  System  fails  to  save  data.   
 Priority:  High   
Frequency  of  Use:  Monthly    
Business  Rules:  BR-21  


<!-- PAGE 133 -->


### 4.2.26  Audit  Invoice  Ledger  &  Transactions
GAMS-SRS_v1.0   133 /143   

BR-04  
Other  Information:  Package  updates  affect  future  bookings  only.  
Assumptions:  Package  pricing  is  provided  by  management.  
ID  and  Name:  UC26  ΓÇô  Audit  Invoice  Ledger  &  Transactions   
Primary  Actor:  Business  Manager  
Secondary  Actors:   
Description:  Allows  business  managers  to  review  invoice  records  and  financial  transactions.  
Trigger:  Business  Manager  selects  "Invoice  Audit".  
Preconditions:  1.Business  Manager  is  logged  in.  
2.Financial  records  exist.  
Postconditions:  Audit  information  is  displayed.  
Normal  Flow:  1.  Business  Manager  accesses  the  audit  module.  2.System  retrieves  invoice  and  transaction  records.  3.System  displays  ledger  information.  4.Manager  filters  or  searches  records.  5.Manager  reviews  transaction  details.    Alternative  Flows:  A1.  Manager  exports  audit  reports.  
Exceptions:   E1.  No  records  found.  
E2.  System  fails  to  retrieve  data.   



<!-- PAGE 134 -->


### 4.2.27  View  Resort  Operations  Dashboard  4.2.28  Analyze  Weekly  Occupancy  &  Revenue  Trend  Data
ID  and  Name:  UC-28  ΓÇô  Analyze  Weekly  Occupancy  &  Revenue  Trend  Data   Primary  Actor:  Business  Manager   Secondary  Actors:  System  Administrator   Description:  Allows  the  business  manager  to  analyze  weekly  occupancy  rates,  booking  trends,  and  revenue  performance  to  support  business  decision-making.   Trigger:  Business  Manager  selects  "Occupancy  &  Revenue  Analytics"  from  Dashboard.  Preconditions:  1.  Business  Manager  is  authenticated.  2.  Occupancy  and  revenue  data  exist  in  the  system.  3.  Reporting  service  is  available.  Postconditions:  1.  Weekly  analytics  report  is  generated.  2.  Trend  data  is  displayed.  3.  Audit  log  is  recorded.  Normal  Flow:  1.  Business  Manager  opens  Analytics  Dashboard.  2.  System  displays  available  report  filters.  3.  Business  Manager  selects  a  weekly  period.  4.  System  retrieves  occupancy  data.  5.  System  retrieves  revenue  data.  6.  System  calculates  trends  and  KPIs.  7.  System  generates  charts  and  summaries.  8.  System  displays  report.  
GAMS-SRS_v1.0   134 /143   

Priority:  High   
Frequency  of  Use:  Multiple  times  daily.   
Business  Rules:  BR-21   
BR-26  
BR-27   
Other  Information:  Historical  transaction  records  cannot  be  modified.  
Assumptions:  All  completed  transactions  have  been  recorded  correctly.  


<!-- PAGE 135 -->


## 9.  System  records  audit  log.  Alternative  Flows:  A1.  Manager  exports  report.   ΓåÆ  System  generates  PDF/Excel  file.  A2.  Manager  changes  date  range.   ΓåÆ  System  refreshes  report  data.  Exceptions:  E1.  No  data  available.   ΓåÆ  System  displays  notification.  E2.  Reporting  service  unavailable.   ΓåÆ  System  displays  error  message.  Priority:  High  Frequency  of  Use:  High  Business  Rules:  BR-26  ΓÇô  Transaction  Audit  Trail  BR-27  ΓÇô  Revenue  Calculation  Rule  BR-21  ΓÇô  Role-Based  Access  Control  Other  Information:  1.  Reports  may  include  occupancy  rate,  booking  trends,  total  revenue,  and  revenue  growth  indicators.  2.  Data  may  be  visualized  through  charts,  dashboards,  and  downloadable  reports.  3.  Historical  weekly  data  may  be  compared  for  trend  analysis.  Assumptions:  1.  Booking,  payment,  and  occupancy  records  are  accurate  and  up-to-date.  2.  All  completed  transactions  have  been  properly  recorded  in  the  system.  3.  Business  Manager  has  permission  to  access  analytical  reports.   4.2.29  Manage  Inventory  &  Resort  Supplies
ID  and  Name:  UC-29  ΓÇô  Manage  Inventory  &  Resort  Supplies   Primary  Actor:  Business  Manager   Secondary  Actors:  Inventory  Staff,  System   Description:  Allows  the  business  manager  to  manage  resort  inventory,  monitor  stock  levels,  and  track  supply  consumption.  Trigger:  Business  Manager  selects  "Inventory  Management".  Preconditions:  1.  Manager  is  authenticated.  2.  Inventory  module  is  active.  Postconditions:  1.  Health  and  dietary  profile  is  encrypted  and  stored.  2.  Authorized  services  may  access  only  relevant  information.  
GAMS-SRS_v1.0   135 /143   



<!-- PAGE 136 -->


## 3.  Audit  logs  are  recorded.  Normal  Flow:  1.  Manager  opens  Inventory  Management.  2.  System  displays  inventory  list.  3.  Manager  searches  or  selects  an  item.  4.  Manager  updates  quantity,  status,  or  supplier  information.  5.  System  validates  input.  6.  System  updates  inventory  records.  7.  System  recalculates  stock  levels.  8.  System  displays  confirmation.  9.  System  records  audit  log.  Alternative  Flows:  A1.  Manager  filters  inventory  by  category.  A2.  Manager  views  low-stock  items.
Exceptions:  E1.  Invalid  quantity  entered.  E2.  Database  update  failure.   Priority:  High  Frequency  of  Use:  High  Business  Rules:  BR-21  ΓÇô  Role-Based  Access  Control  BR-25  ΓÇô  Non-Negative  Inventory  Other  Information:  1.  Inventory  includes  resort  supplies,  spa  products,  food  ingredients,  cleaning  materials,  and  maintenance  equipment.  2.  The  system  may  generate  low-stock  warnings  for  inventory  monitoring.  Assumptions:  1.  Inventory  quantities  are  updated  whenever  stock  movements  occur.  2.  Authorized  personnel  maintain  inventory  records  regularly.  3.  All  inventory  items  have  unique  identifiers.   4.2.30  Register  New  Inventory  Item  
ID  and  Name:  UC-30  ΓÇô  Register  New  Inventory  Item  Primary  Actor:  Business  Manager   Secondary  Actors:  System  Administrator   Description:  Allows  the  business  manager  to  register  a  new  inventory  item  into  the  resort  inventory  system.  Trigger:  Manager  clicks  "Add  New  Inventory  Item".  
GAMS-SRS_v1.0   136 /143   



<!-- PAGE 137 -->


Preconditions:  1.  Manager  is  authenticated.  2.  Inventory  module  is  available.  Postconditions:  1.  New  inventory  item  is  stored.  2.  Item  becomes  available  for  inventory  tracking.  Normal  Flow:  1.  Manager  selects  Add  New  Item.  2.  System  displays  registration  form.  3.  Manager  enters  item  details.  4.  Manager  enters  category  and  quantity.  5.  Manager  enters  supplier  information.  6.  Manager  submits  form.  7.  System  validates  data.  8.  System  creates  inventory  record.  9.  System  displays  confirmation.  Alternative  Flows:  A1.  Manager  saves  as  draft.  A2.  Manager  uploads  item  image.  
Exceptions:  E1.  Required  fields  missing.  E2.  Duplicate  item  exists.   Priority:  Medium   Frequency  of  Use:  Medium   Business  Rules:  BR-21  ΓÇô  Role-Based  Access  Control  BR-24  ΓÇô  Unique  Inventory  Item  Code  BR-25  ΓÇô  Non-Negative  Inventory  Other  Information:  1.  Inventory  items  may  contain  category,  supplier,  quantity,  unit  price,  and  storage  information.  2.  Newly  created  items  become  available  for  inventory  tracking  immediately.  Assumptions:  1.  Business  Manager  provides  valid  inventory  information.  2.  Inventory  item  codes  follow  the  organization's  naming  convention.  3.  Supplier  information  is  accurate.   4.2.31  Manage  Customer  Reviews,  Feedback,  Complaints  
ID  and  Name:  UC-31  ΓÇô  Manage  Customer  Reviews,  Feedback,  Complaints   
GAMS-SRS_v1.0   137 /143   



<!-- PAGE 138 -->


Primary  Actor:  Business  Manager   Secondary  Actors:  Guest,  System   Description:  Allows  the  business  manager  to  review,  respond  to,  and  manage  customer  reviews,  feedback,  and  complaints.  Trigger:  Manager  selects  "Customer  Feedback  Management".  Preconditions:  1.  Manager  is  authenticated.  2.  Feedback  data  exists.  Postconditions:  1.  Feedback  status  is  updated.  2.  Responses  are  recorded.  3.  Audit  log  is  generated.  Normal  Flow:  1.  Manager  opens  Feedback  Management.  2.  System  displays  feedback  list.  3.  Manager  selects  a  review  or  complaint.  4.  System  displays  details.  5.  Manager  enters  response  or  resolution.  6.  Manager  updates  status.  7.  System  stores  response.  8.  System  notifies  customer.  9.  System  records  audit  log.  Alternative  Flows:  A1.  Manager  marks  feedback  as  resolved.  A2.  Manager  escalates  complaint  to  Administrator.  
Exceptions:  E1.  Feedback  record  not  found.  E2.  Notification  service  unavailable.   Priority:  High  Frequency  of  Use:  High  Business  Rules:  BR-18  ΓÇô  Review  Eligibility  BR-19  ΓÇô  Single  Review  Per  Booking  BR-21  ΓÇô  Role-Based  Access  Control  Other  Information:  1.  Feedback  records  may  include  ratings,  reviews,  suggestions,  complaints,  and  manager  responses.  2.  Complaint  history  is  retained  for  service  quality  improvement  and  reporting  purposes.  Assumptions:  1.  Customer  feedback  originates  from  legitimate  completed  bookings.  
GAMS-SRS_v1.0   138 /143   



<!-- PAGE 139 -->


## 2.  Managers  respond  to  feedback  according  to  resort  service  policies.  3.  Review  records  remain  available  for  future  reference.   4.2.32  Manage  Staff  Shift  Scheduling  &  Attendance
ID  and  Name:  UC-32  ΓÇô  Manage  Staff  Shift  Scheduling  &  Attendance   Primary  Actor:  Business  Manager   Secondary  Actors:  Staff  Member,  System  
Description:  Allows  the  business  manager  to  create  staff  schedules,  monitor  attendance,  and  manage  shift  assignments.  Trigger:  Manager  selects  "Shift  Scheduling  &  Attendance".  Preconditions:  1.  Manager  is  authenticated.  2.  Staff  records  exist.  Postconditions:  1.  Shift  schedules  are  updated.  2.  Attendance  records  are  stored.  Normal  Flow:  1.  Manager  opens  Scheduling  Module.  2.  System  displays  staff  calendar.  3.  Manager  selects  date  and  shift.  4.  Manager  assigns  staff  members.  5.  System  checks  scheduling  conflicts.  6.  System  saves  schedule.  7.  Staff  receive  notifications.  8.  Attendance  records  become  available.  Alternative  Flows:  A1.  Manager  edits  an  existing  shift.  A2.  Manager  approves  attendance  correction  request.  
Exceptions:  E1.  Staff  scheduling  conflict  detected.  E2.  Staff  member  unavailable.   Priority:  High  Frequency  of  Use:  High  Business  Rules:  BR-21  ΓÇô  Role-Based  Access  Control  BR-28  ΓÇô  Shift  Conflict  Prevention  Other  Information:  1.  Shift  schedules  may  be  displayed  in  calendar  format.  
GAMS-SRS_v1.0   139 /143   



<!-- PAGE 140 -->


## 2.  Attendance  records  may  be  used  for  workforce  planning  and  payroll  calculations.  3.  Staff  may  receive  schedule  notifications  through  the  system.  Assumptions:  1.  Staff  availability  information  is  maintained  accurately.  2.  Employees  regularly  check  their  assigned  schedules.  3.  Attendance  records  are  submitted  correctly.   4.2.33  Monitor  Real-time  Room  Status
ID  and  Name:  UC-33  ΓÇô  Monitor  Real-time  Room  Status   Primary  Actor:  Business  Manager   Secondary  Actors:  Receptionist,  Housekeeping  Staff,  System   Description:  Allows  the  business  manager  to  monitor  room  availability,  occupancy,  maintenance  status,  and  housekeeping  progress  in  real  time.  Trigger:  Manager  selects  "Room  Status  Dashboard".  Preconditions:  1.  Manager  is  authenticated.  2.  Room  management  system  is  operational.  Postconditions:  1.  Current  room  status  is  displayed.  2.  Dashboard  reflects  latest  updates.  Normal  Flow:  1.  Manager  opens  Room  Status  Dashboard.  2.  System  retrieves  room  status  data.  3.  System  displays  available  rooms.  4.  System  displays  occupied  rooms.  5.  System  displays  rooms  under  maintenance.  6.  System  displays  housekeeping  progress.  7.  Dashboard  refreshes  automatically.  8.  System  records  viewing  activity.  Alternative  Flows:  A1.  Manager  filters  rooms  by  building/floor.  A2.  Manager  searches  specific  room.  
Exceptions:  E1.  Room  data  unavailable.  E2.  Dashboard  refresh  failure.  Priority:  High  Frequency  of  Use:  Very  High   
GAMS-SRS_v1.0   140 /143   



<!-- PAGE 141 -->


Business  Rules:  BR-21  ΓÇô  Role-Based  Access  Control  BR-29  ΓÇô  Real-Time  Room  Status  BR-13  ΓÇô  Villa  Occupancy  Update  BR-14  ΓÇô  Villa  Release  Update  Other  Information:  1.  Room  status  categories  may  include  Available,  Occupied,  Reserved,  Cleaning,  and  Maintenance.  2.  Dashboard  information  refreshes  automatically  to  reflect  operational  changes.  3.  Status  updates  may  originate  from  Receptionists  and  Housekeeping  Staff.  Assumptions:  1.  Staff  update  room  status  immediately  after  operational  events.  2.  Network  connectivity  is  available  for  real-time  synchronization.  3.  Room  management  services  are  functioning  normally.    

GAMS-SRS_v1.0   141 /143   
