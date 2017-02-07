// This file was semi-automatically generated.
// The plan is to replace it soon with something easier to maintain.

package main

type FieldOffice struct {
	Phone string `json:"phone"` // phone number of the field office, formatted like "205-731-1500"
	City  string `json:"city"`  // city of the field office, such as "Huntsville"
}

// senateFieldOffices maps from a senator's primary phone number
// to their field offices.
var senateFieldOffices = map[string][]FieldOffice{
	// Sessions, Jeff (Alabama)
	"2022244124": []FieldOffice{
		FieldOffice{Phone: "205-731-1500", City: "Birmingham"},
		FieldOffice{Phone: "256-533-0979", City: "Huntsville"},
		FieldOffice{Phone: "251-414-3083", City: "Mobile"},
		FieldOffice{Phone: "334-230-0698", City: "Montgomery"},
		FieldOffice{Phone: "334-792-4924", City: "Wiregrass"},
	},
	// Shelby, Richard (Alabama)
	"2022245744": []FieldOffice{
		FieldOffice{Phone: "205-731-1384", City: "Birmingham"},
		FieldOffice{Phone: "256-772-0460", City: "Huntsville"},
		FieldOffice{Phone: "251-694-4164", City: "Mobile"},
		FieldOffice{Phone: "334-223-7303", City: "Montgomery"},
		FieldOffice{Phone: "205-759-5047", City: "Tuscaloosa"},
	},
	// Murkowski, Lisa (Alaska)
	"2022246665": []FieldOffice{
		FieldOffice{Phone: "907-271-3735", City: "Anchorage"},
		FieldOffice{Phone: "907-456-0233", City: "Fairbanks"},
		FieldOffice{Phone: "907-586-7277", City: "Juneau"},
		FieldOffice{Phone: "907-283-5808", City: "Kenai"},
		FieldOffice{Phone: "907-225-6880", City: "Ketchikan"},
		FieldOffice{Phone: "907-376-7665", City: "Mat-Su Valley"},
	},
	// Sullivan, Dan (Alaska)
	"2022243004": []FieldOffice{
		FieldOffice{Phone: "907-271-5915", City: "Anchorage"},
		FieldOffice{Phone: "907-456-0261", City: "Fairbanks"},
		FieldOffice{Phone: "907-586-7277", City: "Juneau"},
		FieldOffice{Phone: "907-283-4000", City: "Kenai"},
		FieldOffice{Phone: "907-225-6880", City: "Ketchikan"},
		FieldOffice{Phone: "907-357-9956", City: "Mat-Su Valley"},
	},
	// Flake, Jeff (Arizona)
	"2022244521": []FieldOffice{
		FieldOffice{Phone: "602-840-1891", City: "Phoenix"},
		FieldOffice{Phone: "520-575-8633", City: "Tucson"},
	},
	// McCain, John (Arizona)
	"2022242235": []FieldOffice{
		FieldOffice{Phone: "602-952-2410", City: "Phoenix"},
		FieldOffice{Phone: "928-445-0833", City: "Prescott"},
		FieldOffice{Phone: "520-670-6334", City: "Tucson"},
	},
	// Boozman, John (Arkansas)
	"2022244843": []FieldOffice{
		FieldOffice{Phone: "870-863-4641", City: "El Dorado"},
		FieldOffice{Phone: "479-573-0189", City: "Fort Smith"},
		FieldOffice{Phone: "870-268-6925", City: "Jonesboro"},
		FieldOffice{Phone: "501-372-7153", City: "Little Rock"},
		FieldOffice{Phone: "479-725-0400", City: "Lowell"},
		FieldOffice{Phone: "870-424-0129", City: "Mountain Home"},
		FieldOffice{Phone: "870-672-6941", City: "Stuttgart"},
	},
	// Cotton, Tom (Arkansas)
	"2022242353": []FieldOffice{
		FieldOffice{Phone: "870-864-8582", City: "El Dorado"},
		FieldOffice{Phone: "870-933-6223", City: "Jonesboro"},
		FieldOffice{Phone: "501-223-9081", City: "Little Rock"},
		FieldOffice{Phone: "479-751-0879", City: "Springdale"},
	},
	// Feinstein, Dianne (California)
	"2022243841": []FieldOffice{
		FieldOffice{Phone: "559-485-7430", City: "Fresno"},
		FieldOffice{Phone: "310-914-7300", City: "Los Angeles"},
		FieldOffice{Phone: "619-231-9712", City: "San Diego"},
		FieldOffice{Phone: "415-393-0707", City: "San Francisco"},
	},
	// Harris, Kamala (California)
	"2022243553": []FieldOffice{
		FieldOffice{Phone: "916-448-2787", City: "Fresno"},
		FieldOffice{Phone: "213-894-5000", City: "Los Angeles"},
		FieldOffice{Phone: "916-448-2787", City: "Sacramento"},
		FieldOffice{Phone: "619-239-3884", City: "San Diego"},
		FieldOffice{Phone: "415-355-9041", City: "San Francisco"},
	},
	// Pelosi, Nancy (California)
	"2022254965": []FieldOffice{
		FieldOffice{Phone: "415-556-4862", City: "San Francisco"},
	},
	// Bennet, Michael (Colorado)
	"2022245852": []FieldOffice{
		FieldOffice{Phone: "719-542-7550", City: "Arkansas Valley"},
		FieldOffice{Phone: "303-455-7600", City: "Denver Metro"},
		FieldOffice{Phone: "970-259-1710", City: "Four Corners"},
		FieldOffice{Phone: "970-224-2200", City: "Northern Colorado"},
		FieldOffice{Phone: "970-241-6631", City: "Northwest/I-70W"},
		FieldOffice{Phone: "719-328-1100", City: "Pikes Peak"},
		FieldOffice{Phone: "719-587-0096", City: "San Luis Valley"},
	},
	// Gardner, Cory (Colorado)
	"2022245941": []FieldOffice{
		FieldOffice{Phone: "719-632-6706", City: "Colorado Springs"},
		FieldOffice{Phone: "303-391-5777", City: "Denver"},
		FieldOffice{Phone: "970-484-3502", City: "Fort Collins"},
		FieldOffice{Phone: "970-245-9553", City: "Grand Junction"},
		FieldOffice{Phone: "970-352-5546", City: "Greeley"},
		FieldOffice{Phone: "719-543-1324", City: "Pueblo"},
		FieldOffice{Phone: "970-848-3095", City: "Yuma"},
	},
	// Blumenthal, Richard (Connecticut)
	"2022242823": []FieldOffice{
		FieldOffice{Phone: "203-330-0598", City: "Bridgeport"},
		FieldOffice{Phone: "860-258-6940", City: "Hartford"},
	},
	// Murphy, Chris (Connecticut)
	"2022244041": []FieldOffice{
		FieldOffice{Phone: "860-549-8463", City: "Hartford"},
	},
	// Carper, Tom (Delaware)
	"2022242441": []FieldOffice{
		FieldOffice{Phone: "302-674-3308", City: "Dover"},
		FieldOffice{Phone: "302-856-7690", City: "Georgetown"},
		FieldOffice{Phone: "302-573-6291", City: "Wilmington"},
	},
	// Coons, Chris (Delaware)
	"2022245042": []FieldOffice{
		FieldOffice{Phone: "302-736-5601", City: "Dover"},
		FieldOffice{Phone: "302-573-6345", City: "Wilmington"},
	},
	// Nelson, Bill (Florida)
	"2022245274": []FieldOffice{
		FieldOffice{Phone: "954-693-4851", City: "Broward"},
		FieldOffice{Phone: "239-334-7760", City: "Fort Myers"},
		FieldOffice{Phone: "904-346-4500", City: "Jacksonville"},
		FieldOffice{Phone: "305-536-5999", City: "Miami-Dade"},
		FieldOffice{Phone: "407-872-7161", City: "Orlando"},
		FieldOffice{Phone: "850-942-8415", City: "Tallahassee"},
		FieldOffice{Phone: "813-225-7040", City: "Tampa"},
		FieldOffice{Phone: "561-514-0189", City: "West Palm Beach"},
	},
	// Rubio, Marco (Florida)
	"2022243041": []FieldOffice{
		FieldOffice{Phone: "904-398-8586", City: "Jacksonville"},
		FieldOffice{Phone: "305-418-8553", City: "Miami"},
		FieldOffice{Phone: "239-213-1521", City: "Naples"},
		FieldOffice{Phone: "407-254-2573", City: "Orlando"},
		FieldOffice{Phone: "561-775-3360", City: "Palm Beach"},
		FieldOffice{Phone: "850-433-2603", City: "Pensacola"},
		FieldOffice{Phone: "850-599-9100", City: "Tallahassee"},
		FieldOffice{Phone: "813-287-5035", City: "Tampa"},
	},
	// Isakson, Johnny (Georgia)
	"2022243643": []FieldOffice{
		FieldOffice{Phone: "770-661-0999", City: "Atlanta"},
	},
	// Perdue, David (Georgia)
	"2022243521": []FieldOffice{
		FieldOffice{Phone: "404-865-0087", City: "Atlanta"},
	},
	// Hirono, Mazie (Hawaii)
	"2022246361": []FieldOffice{
		FieldOffice{Phone: "808-522-8970", City: "Hawaii"},
	},
	// Schatz, Brian (Hawaii)
	"2022243934": []FieldOffice{
		FieldOffice{Phone: "808-523-2061", City: "Honolulu"},
	},
	// Crapo, Mike (Idaho)
	"2022246142": []FieldOffice{
		FieldOffice{Phone: "208-522-9779", City: "Eastern Idaho, North"},
		FieldOffice{Phone: "208-236-6775", City: "Eastern Idaho, South"},
		FieldOffice{Phone: "208-334-1776", City: "Idaho State"},
		FieldOffice{Phone: "208-664-5490", City: "North Idaho"},
		FieldOffice{Phone: "208-743-1492", City: "North-Central Idaho"},
		FieldOffice{Phone: "208-734-2515", City: "South-Central Idaho"},
	},
	// Risch, Jim (Idaho)
	"2022242752": []FieldOffice{
		FieldOffice{Phone: "208-342-7985", City: "Boise"},
		FieldOffice{Phone: "208-667-6130", City: "Coeur D'Alene"},
		FieldOffice{Phone: "208-523-5541", City: "Idaho Falls"},
		FieldOffice{Phone: "208-743-0792", City: "Lewiston"},
		FieldOffice{Phone: "208-236-6817", City: "Pocatello"},
		FieldOffice{Phone: "208-734-6780", City: "Twin Falls"},
	},
	// Duckworth, Tammy (Illinois)
	"2022242854": []FieldOffice{
		FieldOffice{Phone: "312-886-3506", City: "Chicago"},
	},
	// Durbin, Richard (Illinois)
	"2022242152": []FieldOffice{
		FieldOffice{Phone: "618-351-1122", City: "Carbondale"},
		FieldOffice{Phone: "312-353-4952", City: "Chicago"},
		FieldOffice{Phone: "309-786-5173", City: "Rock Island"},
		FieldOffice{Phone: "217-492-4062", City: "Springfield"},
	},
	// Donnelly, Joe (Indiana)
	"2022244814": []FieldOffice{
		FieldOffice{Phone: "812-425-5813", City: "Evansville"},
		FieldOffice{Phone: "260-420-4955", City: "Fort Wayne"},
		FieldOffice{Phone: "219-852-0089", City: "Hammond"},
		FieldOffice{Phone: "317-226-5555", City: "Indianapolis"},
		FieldOffice{Phone: "812-284-2027", City: "Jeffersonville"},
		FieldOffice{Phone: "574-288-2780", City: "South Bend"},
	},
	// Young, Todd (Indiana)
	"2022245623": []FieldOffice{
		FieldOffice{Phone: "317-226-6700", City: "Indianapolis"},
		FieldOffice{Phone: "812-542-4820", City: "New Albany"},
	},
	// Ernst, Joni (Iowa)
	"2022243254": []FieldOffice{
		FieldOffice{Phone: "319-365-4504", City: "Cedar Rapids"},
		FieldOffice{Phone: "712-352-1167", City: "Council Bluffs"},
		FieldOffice{Phone: "563-322-0677", City: "Davenport"},
		FieldOffice{Phone: "515-284-4574", City: "Des Moines"},
		FieldOffice{Phone: "712-252-1550", City: "Sioux City"},
	},
	// Grassley, Chuck (Iowa)
	"2022243744": []FieldOffice{
		FieldOffice{Phone: "319-363-6832", City: "Cedar Rapids"},
		FieldOffice{Phone: "712-322-7103", City: "Council Bluffs"},
		FieldOffice{Phone: "563-322-4331", City: "Davenport"},
		FieldOffice{Phone: "515-288-1145", City: "Des Moines"},
		FieldOffice{Phone: "712-233-1860", City: "Sioux City"},
		FieldOffice{Phone: "319-232-6657", City: "Waterloo"},
	},
	// Moran, Jerry (Kansas)
	"2022246521": []FieldOffice{
		FieldOffice{Phone: "785-628-6401", City: "Hays"},
		FieldOffice{Phone: "785-539-8973", City: "Manhattan"},
		FieldOffice{Phone: "913-393-0711", City: "Olathe"},
		FieldOffice{Phone: "620-232-2286", City: "Pittsburg"},
		FieldOffice{Phone: "316-631-1410", City: "Wichita"},
	},
	// Roberts, Pat (Kansas)
	"2022244774": []FieldOffice{
		FieldOffice{Phone: "620-227-2244", City: "Dodge City"},
		FieldOffice{Phone: "913-451-9343", City: "Overland Park"},
		FieldOffice{Phone: "785-295-2745", City: "Topeka"},
		FieldOffice{Phone: "316-263-0416", City: "Wichita"},
	},
	// McConnell, Mitch (Kentucky)
	"2022242541": []FieldOffice{
		FieldOffice{Phone: "270-781-1673", City: "Bowling Green"},
		FieldOffice{Phone: "859-578-0188", City: "Ft. Wright"},
		FieldOffice{Phone: "859-224-8286", City: "Lexington"},
		FieldOffice{Phone: "606-864-2026", City: "London"},
		FieldOffice{Phone: "502-582-6304", City: "Louisville"},
		FieldOffice{Phone: "270-442-4554", City: "Paducah"},
	},
	// Paul, Rand (Kentucky)
	"2022244343": []FieldOffice{
		FieldOffice{Phone: "270-782-8303", City: "Bowling Green"},
		FieldOffice{Phone: "859-426-0165", City: "Crescent Springs"},
		FieldOffice{Phone: "270-885-1212", City: "Hopkinsville"},
		FieldOffice{Phone: "859-219-2239", City: "Lexington"},
		FieldOffice{Phone: "502-582-5341", City: "Louisville"},
		FieldOffice{Phone: "270-689-9085", City: "Owensboro"},
	},
	// Cassidy, Bill (Lousiana)
	"2022245824": []FieldOffice{
		FieldOffice{Phone: "318-448-7176", City: "Alexandria"},
		FieldOffice{Phone: "225-929-7711", City: "Baton Rouge"},
		FieldOffice{Phone: "337-261-1400", City: "Lafayette"},
		FieldOffice{Phone: "337-493-5398", City: "Lake Charles"},
		FieldOffice{Phone: "504-838-0130", City: "Metairie"},
		FieldOffice{Phone: "318-324-2111", City: "Monroe"},
		FieldOffice{Phone: "318-798-3215", City: "Shreveport"},
	},
	// Kennedy, John (Lousiana)
	"2022244623": []FieldOffice{},
	// Collins, Susan (Maine)
	"2022242523": []FieldOffice{
		FieldOffice{Phone: "207-622-8414", City: "Augusta"},
		FieldOffice{Phone: "207-945-0417", City: "Bangor"},
		FieldOffice{Phone: "207-283-1101", City: "Biddeford"},
		FieldOffice{Phone: "207-493-7873", City: "Caribou"},
		FieldOffice{Phone: "207-784-6969", City: "Lewiston"},
		FieldOffice{Phone: "207-780-3575", City: "Portland"},
	},
	// King, Angus (Maine)
	"2022245344": []FieldOffice{
		FieldOffice{Phone: "207-622-8292", City: "Augusta"},
		FieldOffice{Phone: "207-945-8000", City: "Bangor"},
		FieldOffice{Phone: "207-764-5124", City: "Presque Isle"},
		FieldOffice{Phone: "207-883-1588", City: "Scarborough"},
	},
	// Cardin, Ben (Maryland)
	"2022244524": []FieldOffice{
		FieldOffice{Phone: "410-962-4436", City: "Baltimore"},
		FieldOffice{Phone: "301-860-0414", City: "Bowie"},
		FieldOffice{Phone: "301-777-2957", City: "Cumberland"},
		FieldOffice{Phone: "301-762-2974", City: "Rockville"},
		FieldOffice{Phone: "410-546-4250", City: "Salisbury"},
		FieldOffice{Phone: "202-870-1164", City: "Southern Maryland"},
	},
	// Van Hollen, Chris (Maryland)
	"2022244654": []FieldOffice{},
	// Markey, Ed (Massachusetts)
	"2022242742": []FieldOffice{
		FieldOffice{Phone: "617-565-8519", City: "Boston"},
		FieldOffice{Phone: "508-677-0523", City: "Fall River"},
		FieldOffice{Phone: "413-785-4610", City: "Springfield"},
	},
	// Warren, Elizabeth (Massachusetts)
	"2022244543": []FieldOffice{
		FieldOffice{Phone: "617-565-3170", City: "Boston"},
		FieldOffice{Phone: "413-788-2690", City: "Springfield"},
	},
	// Peters, Gary (Michigan)
	"2022246221": []FieldOffice{
		FieldOffice{Phone: "313-226-6020", City: "Detroit"},
		FieldOffice{Phone: "616-233-9150", City: "Grand Rapids"},
		FieldOffice{Phone: "517-377-1508", City: "Lansing"},
		FieldOffice{Phone: "906-226-4554", City: "Marquette"},
		FieldOffice{Phone: "248-608-8040", City: "Rochester"},
		FieldOffice{Phone: "989-754-0112", City: "Saginaw"},
		FieldOffice{Phone: "231-947-7773", City: "Traverse City"},
	},
	// Stabenow, Debbie (Michigan)
	"2022244822": []FieldOffice{
		FieldOffice{Phone: "810-720-4172", City: "Flint/Saginaw Bay"},
		FieldOffice{Phone: "517-203-1760", City: "Mid-Michigan"},
		FieldOffice{Phone: "231-929-1031", City: "Northern Michigan"},
		FieldOffice{Phone: "313-961-4330", City: "Southeast Michigan"},
		FieldOffice{Phone: "906-228-8756", City: "Upper Peninsula"},
		FieldOffice{Phone: "616-975-0052", City: "West Michigan"},
	},
	// Franken, Al (Minnesota)
	"2022245641": []FieldOffice{
		FieldOffice{Phone: "218-722-2390", City: "Duluth"},
		FieldOffice{Phone: "218-284-8721", City: "Moorhead"},
		FieldOffice{Phone: "507-288-2003", City: "Rochester"},
		FieldOffice{Phone: "651-221-1016", City: "Saint Paul"},
	},
	// Klobuchar, Amy (Minnesota)
	"2022243244": []FieldOffice{
		FieldOffice{Phone: "612-727-5220", City: "Metro"},
		FieldOffice{Phone: "218-741-9690", City: "Northeastern"},
		FieldOffice{Phone: "218-287-2219", City: "Northwestern &amp; Central"},
		FieldOffice{Phone: "507-288-5321", City: "Southern"},
	},
	// Cochran, Thad (Mississippi)
	"2022245054": []FieldOffice{
		FieldOffice{Phone: "228-867-9710", City: "Gulf Coast"},
		FieldOffice{Phone: "601-965-4459", City: "Jackson"},
		FieldOffice{Phone: "662-236-1018", City: "Oxford"},
	},
	// Wicker, Roger (Mississippi)
	"2022246253": []FieldOffice{
		FieldOffice{Phone: "228-871-7017", City: "Gulfport"},
		FieldOffice{Phone: "662-429-1002", City: "Hernando"},
		FieldOffice{Phone: "601-965-4644", City: "Jackson"},
		FieldOffice{Phone: "662-844-5010", City: "Tupelo"},
	},
	// Blunt, Roy (Missouri)
	"2022245721": []FieldOffice{
		FieldOffice{Phone: "573-334-7044", City: "Cape Girardeau"},
		FieldOffice{Phone: "573-442-8151", City: "Columbia"},
		FieldOffice{Phone: "816-471-7141", City: "Kansas City"},
		FieldOffice{Phone: "417-877-7814", City: "Springfield"},
		FieldOffice{Phone: "314-725-4484", City: "St. Louis/Clayton"},
	},
	// McCaskill, Claire (Missouri)
	"2022246154": []FieldOffice{
		FieldOffice{Phone: "573-651-0964", City: "Cape Girardeau"},
		FieldOffice{Phone: "573-442-7130", City: "Columbia"},
		FieldOffice{Phone: "816-421-1639", City: "Kansas City"},
		FieldOffice{Phone: "417-868-8745", City: "Springfield"},
		FieldOffice{Phone: "314-367-1364", City: "St. Louis"},
	},
	// Daines, Steve (Montana)
	"2022242651": []FieldOffice{
		FieldOffice{Phone: "406-245-6822", City: "Billings"},
		FieldOffice{Phone: "406-587-3446", City: "Bozeman"},
		FieldOffice{Phone: "406-453-0148", City: "Great Falls"},
		FieldOffice{Phone: "406-665-4126", City: "Hardin"},
		FieldOffice{Phone: "406-443-3189", City: "Helena"},
		FieldOffice{Phone: "406-257-3765", City: "Kalispell"},
		FieldOffice{Phone: "406-549-8198", City: "Missoula"},
		FieldOffice{Phone: "406-482-9010", City: "Sidney"},
	},
	// Tester, Jon (Montana)
	"2022242644": []FieldOffice{
		FieldOffice{Phone: "406-252-0550", City: "Billings"},
		FieldOffice{Phone: "406-586-4450", City: "Bozeman"},
		FieldOffice{Phone: "406-723-3277", City: "Butte"},
		FieldOffice{Phone: "406-365-2391", City: "Glendive"},
		FieldOffice{Phone: "406-452-9585", City: "Great Falls"},
		FieldOffice{Phone: "406-449-5401", City: "Helena"},
		FieldOffice{Phone: "406-257-3360", City: "Kalispell"},
		FieldOffice{Phone: "406-728-3003", City: "Missoula"},
	},
	// Fischer, Deb (Nebraska)
	"2022246551": []FieldOffice{
		FieldOffice{Phone: "308-234-2361", City: "Kearney"},
		FieldOffice{Phone: "402-441-4600", City: "Lincoln"},
		FieldOffice{Phone: "402-200-8816", City: "Norfolk"},
		FieldOffice{Phone: "402-391-3411", City: "Omaha"},
		FieldOffice{Phone: "308-630-2329", City: "Scottsbluff"},
	},
	// Sasse, Ben (Nebraska)
	"2022244224": []FieldOffice{
		FieldOffice{Phone: "308-233-3677", City: "Kearney"},
		FieldOffice{Phone: "402-476-1400", City: "Lincoln"},
		FieldOffice{Phone: "402-550-8040", City: "Omaha"},
		FieldOffice{Phone: "308-632-6032", City: "Scottsbluff"},
	},
	// Cortez Masto, Catherine (Nevada)
	"2022243542": []FieldOffice{
		FieldOffice{Phone: "702-388-5020", City: "Las Vegas"},
		FieldOffice{Phone: "775-686-5750", City: "Reno"},
	},
	// Heller, Dean (Nevada)
	"2022246244": []FieldOffice{
		FieldOffice{Phone: "702-388-6605", City: "Las Vegas"},
		FieldOffice{Phone: "775-686-5770", City: "Reno"},
	},
	// Hassan, Maggie (New Hampshire)
	"2022243324": []FieldOffice{
		FieldOffice{Phone: "603-622-2204", City: "Manchester"},
	},
	// Shaheen, Jeanne (New Hampshire)
	"2022242841": []FieldOffice{
		FieldOffice{Phone: "603-752-6300", City: "Berlin"},
		FieldOffice{Phone: "603-542-4872", City: "Claremont"},
		FieldOffice{Phone: "603-750-3004", City: "Dover"},
		FieldOffice{Phone: "603-358-6604", City: "Keene"},
		FieldOffice{Phone: "603-647-7500", City: "Manchester"},
		FieldOffice{Phone: "603-883-0196", City: "Nashua"},
	},
	// Booker, Cory (New Jersey)
	"2022243224": []FieldOffice{
		FieldOffice{Phone: "856-338-8922", City: "Camden"},
		FieldOffice{Phone: "973-639-8700", City: "Newark"},
	},
	// Menendez, Bob (New Jersey)
	"2022244744": []FieldOffice{
		FieldOffice{Phone: "856-757-5353", City: "Barrington"},
		FieldOffice{Phone: "973-645-3030", City: "Newark"},
	},
	// Heinrich, Martin (New Mexico)
	"2022245521": []FieldOffice{
		FieldOffice{Phone: "505-346-6601", City: "Albuquerque"},
		FieldOffice{Phone: "505-325-5030", City: "Farmington"},
		FieldOffice{Phone: "575-523-6561", City: "Las Cruces"},
		FieldOffice{Phone: "575-622-7113", City: "Roswell"},
		FieldOffice{Phone: "505-988-6647", City: "Santa Fe"},
	},
	// Udall, Tom (New Mexico)
	"2022246621": []FieldOffice{
		FieldOffice{Phone: "505-346-6791", City: "Albuquerque"},
		FieldOffice{Phone: "575-234-0366", City: "Carlsbad"},
		FieldOffice{Phone: "575-356-6811", City: "Eastside"},
		FieldOffice{Phone: "575-526-5475", City: "Las Cruces"},
		FieldOffice{Phone: "505-988-6511", City: "Santa Fe"},
	},
	// Gillibrand, Kirsten (New York)
	"2022244451": []FieldOffice{
		FieldOffice{Phone: "518-431-0120", City: "Albany"},
		FieldOffice{Phone: "716-854-9725", City: "Buffalo"},
		FieldOffice{Phone: "845-875-4585", City: "Hudson Valley"},
		FieldOffice{Phone: "631-249-2825", City: "Long Island"},
		FieldOffice{Phone: "212-688-6262", City: "New York City"},
		FieldOffice{Phone: "315-376-6118", City: "North Country"},
		FieldOffice{Phone: "585-263-6250", City: "Rochester"},
		FieldOffice{Phone: "315-448-0470", City: "Syracuse"},
	},
	// Schumer, Chuck (New York)
	"2022246542": []FieldOffice{
		FieldOffice{Phone: "518-431-4070", City: "Albany"},
		FieldOffice{Phone: "607-772-6792", City: "Binghamton"},
		FieldOffice{Phone: "716-846-4111", City: "Buffalo"},
		FieldOffice{Phone: "631-753-0978", City: "Melville"},
		FieldOffice{Phone: "212-486-4430", City: "New York City"},
		FieldOffice{Phone: "914-734-1532", City: "Peekskill"},
		FieldOffice{Phone: "585-263-5866", City: "Rochester"},
		FieldOffice{Phone: "315-423-5471", City: "Syracuse"},
	},
	// Burr, Richard (North Carolina)
	"2022243154": []FieldOffice{
		FieldOffice{Phone: "828-350-2437", City: "Asheville"},
		FieldOffice{Phone: "704-833-0854", City: "Gastonia"},
		FieldOffice{Phone: "252-977-9522", City: "Rocky Mount"},
		FieldOffice{Phone: "910-251-1058", City: "Wilmington"},
		FieldOffice{Phone: "336-631-5125", City: "Winston-Salem"},
	},
	// Tillis, Thom (North Carolina)
	"2022246342": []FieldOffice{
		FieldOffice{Phone: "704-509-9087", City: "Charlotte"},
		FieldOffice{Phone: "252-329-0371", City: "Greenville"},
		FieldOffice{Phone: "828-693-8750", City: "Hendersonville"},
		FieldOffice{Phone: "336-885-0685", City: "High Point"},
		FieldOffice{Phone: "919-856-4630", City: "Raleigh"},
	},
	// Heitkamp, Heidi (North Dakota)
	"2022242043": []FieldOffice{
		FieldOffice{Phone: "701-258-4648", City: "Bismarck"},
		FieldOffice{Phone: "701-225-0974", City: "Dickinson"},
		FieldOffice{Phone: "701-232-8030", City: "Fargo"},
		FieldOffice{Phone: "701-775-9601", City: "Grand Forks"},
		FieldOffice{Phone: "701-852-0703", City: "Minot"},
	},
	// Hoeven, John (North Dakota)
	"2022242551": []FieldOffice{
		FieldOffice{Phone: "701-250-4618", City: "Bismarck"},
		FieldOffice{Phone: "701-239-5389", City: "Fargo"},
		FieldOffice{Phone: "701-746-8972", City: "Grand Forks"},
		FieldOffice{Phone: "701-838-1361", City: "Minot"},
		FieldOffice{Phone: "701-580-4535", City: "Western North Dakota"},
	},
	// Brown, Sherrod (Ohio)
	"2022242315": []FieldOffice{
		FieldOffice{Phone: "513-684-1021", City: "Cincinnati"},
		FieldOffice{Phone: "216-522-7272", City: "Cleveland"},
		FieldOffice{Phone: "614-469-2083", City: "Columbus"},
		FieldOffice{Phone: "440-242-4100", City: "Lorain"},
	},
	// Portman, Rob (Ohio)
	"2022243353": []FieldOffice{
		FieldOffice{Phone: "513-684-3265", City: "Cincinnati"},
		FieldOffice{Phone: "216-522-7095", City: "Cleveland"},
		FieldOffice{Phone: "614-469-6774", City: "Columbus"},
		FieldOffice{Phone: "419-259-3895", City: "Toledo"},
	},
	// Inhofe, Jim (Oklahoma)
	"2022244721": []FieldOffice{
		FieldOffice{Phone: "580-234-5105", City: "Enid"},
		FieldOffice{Phone: "918-426-0933", City: "McAlester"},
		FieldOffice{Phone: "405-608-4381", City: "Oklahoma City"},
		FieldOffice{Phone: "918-748-5111", City: "Tulsa"},
	},
	// Lankford, James (Oklahoma)
	"2022245754": []FieldOffice{
		FieldOffice{Phone: "405-231-4941", City: "Oklahoma City"},
		FieldOffice{Phone: "918-581-7651", City: "Tulsa"},
	},
	// Merkley, Jeff (Oregon)
	"2022243753": []FieldOffice{
		FieldOffice{Phone: "541-318-1298", City: "Bend"},
		FieldOffice{Phone: "541-465-6750", City: "Eugene"},
		FieldOffice{Phone: "541-608-9102", City: "Medford"},
		FieldOffice{Phone: "541-278-1129", City: "Pendleton"},
		FieldOffice{Phone: "503-326-3386", City: "Portland"},
		FieldOffice{Phone: "503-362-8102", City: "Salem"},
	},
	// Wyden, Ron (Oregon)
	"2022245244": []FieldOffice{
		FieldOffice{Phone: "541-330-9142", City: "Bend"},
		FieldOffice{Phone: "541-431-0229", City: "Eugene"},
		FieldOffice{Phone: "541-962-7691", City: "La Grande"},
		FieldOffice{Phone: "541-858-5122", City: "Medford"},
		FieldOffice{Phone: "503-326-7525", City: "Portland"},
		FieldOffice{Phone: "503-589-4555", City: "Salem"},
	},
	// Casey, Bob (Pennsylvania)
	"2022246324": []FieldOffice{
		FieldOffice{Phone: "814-357-0314", City: "Central Pa"},
		FieldOffice{Phone: "814-874-5080", City: "Erie"},
		FieldOffice{Phone: "717-231-7540", City: "Harrisburg"},
		FieldOffice{Phone: "610-782-9470", City: "Lehigh Valley"},
		FieldOffice{Phone: "570-941-0930", City: "Northeastern"},
		FieldOffice{Phone: "215-405-9660", City: "Philadelphia"},
		FieldOffice{Phone: "412-803-7370", City: "Pittsburgh"},
	},
	// Toomey, Pat (Pennsylvania)
	"2022244254": []FieldOffice{
		FieldOffice{Phone: "610-434-1444", City: "Allentown/Lehigh Valley"},
		FieldOffice{Phone: "814-453-3010", City: "Erie"},
		FieldOffice{Phone: "717-782-3951", City: "Harrisburg"},
		FieldOffice{Phone: "814-266-5970", City: "Johnstown"},
		FieldOffice{Phone: "215-241-1090", City: "Philadelphia"},
		FieldOffice{Phone: "412-803-3501", City: "Pittsburgh"},
		FieldOffice{Phone: "570-941-3540", City: "Scranton"},
	},
	// Reed, Jack (Rhode Island)
	"2022244642": []FieldOffice{
		FieldOffice{Phone: "401-943-3100", City: "Cranston"},
		FieldOffice{Phone: "401-528-5200", City: "Providence"},
	},
	// Whitehouse, Sheldon (Rhode Island)
	"2022242921": []FieldOffice{
		FieldOffice{Phone: "401-453-5294", City: "Providence"},
	},
	// Graham, Lindsey (South Carolina)
	"2022245972": []FieldOffice{
		FieldOffice{Phone: "864-646-4090", City: "Golden Corner"},
		FieldOffice{Phone: "843-849-3887", City: "Lowcountry"},
		FieldOffice{Phone: "803-933-0112", City: "Midlands"},
		FieldOffice{Phone: "843-669-1505", City: "Pee Dee"},
		FieldOffice{Phone: "803-366-2828", City: "Piedmont"},
		FieldOffice{Phone: "864-250-1417", City: "Upstate"},
	},
	// Scott, Tim (South Carolina)
	"2022246121": []FieldOffice{
		FieldOffice{Phone: "843-727-4525", City: "Lowcountry"},
		FieldOffice{Phone: "803-771-6112", City: "Midlands"},
		FieldOffice{Phone: "864-233-5366", City: "Upstate"},
	},
	// Rounds, Mike (South Dakota)
	"2022245842": []FieldOffice{
		FieldOffice{Phone: "605-225-0366", City: "Aberdeen"},
		FieldOffice{Phone: "605-224-1450", City: "Pierre"},
		FieldOffice{Phone: "605-343-5035", City: "Rapid City"},
		FieldOffice{Phone: "605-336-0486", City: "Sioux Falls"},
	},
	// Thune, John (South Dakota)
	"2022242321": []FieldOffice{
		FieldOffice{Phone: "605-225-8823", City: "Aberdeen"},
		FieldOffice{Phone: "605-348-7551", City: "Rapid City"},
		FieldOffice{Phone: "605-334-9596", City: "Sioux Falls"},
	},
	// Alexander, Lamar (Tennessee)
	"2022244944": []FieldOffice{
		FieldOffice{Phone: "423-752-5337", City: "Chattanooga"},
		FieldOffice{Phone: "731-664-0289", City: "Jackson"},
		FieldOffice{Phone: "865-545-4253", City: "Knoxville"},
		FieldOffice{Phone: "901-544-4224", City: "Memphis"},
		FieldOffice{Phone: "615-736-5129", City: "Nashville"},
		FieldOffice{Phone: "423-325-6240", City: "Tri-Cities"},
	},
	// Corker, Bob (Tennessee)
	"2022243344": []FieldOffice{
		FieldOffice{Phone: "423-756-2757", City: "Chattanooga"},
		FieldOffice{Phone: "731-664-2294", City: "Jackson"},
		FieldOffice{Phone: "865-637-4180", City: "Knoxville"},
		FieldOffice{Phone: "901-683-1910", City: "Memphis"},
		FieldOffice{Phone: "615-279-8125", City: "Nashville"},
		FieldOffice{Phone: "423-753-2263", City: "Tri-Cities"},
	},
	// Cornyn, John (Texas)
	"2022242934": []FieldOffice{
		FieldOffice{Phone: "512-469-6034", City: "Central Texas"},
		FieldOffice{Phone: "903-593-0902", City: "East Texas"},
		FieldOffice{Phone: "972-239-1310", City: "North Texas"},
		FieldOffice{Phone: "210-224-7485", City: "South Central Texas"},
		FieldOffice{Phone: "956-423-0162", City: "South Texas"},
		FieldOffice{Phone: "713-572-3337", City: "Southeast Texas"},
		FieldOffice{Phone: "806-472-7533", City: "West Texas"},
	},
	// Cruz, Ted (Texas)
	"2022245922": []FieldOffice{
		FieldOffice{Phone: "512-916-5834", City: "Central Texas"},
		FieldOffice{Phone: "903-593-5130", City: "East Texas"},
		FieldOffice{Phone: "214-599-8749", City: "North Texas"},
		FieldOffice{Phone: "956-686-7339", City: "South Texas"},
		FieldOffice{Phone: "210-340-2885", City: "South/Central Texas"},
		FieldOffice{Phone: "713-718-3057", City: "Southeast Texas"},
	},
	// Hatch, Orrin (Utah)
	"2022245251": []FieldOffice{
		FieldOffice{Phone: "435-586-8435", City: "Cedar City"},
		FieldOffice{Phone: "801-625-5672", City: "Ogden"},
		FieldOffice{Phone: "801-375-7881", City: "Provo"},
		FieldOffice{Phone: "801-524-4380", City: "Salt Lake City"},
		FieldOffice{Phone: "435-634-1795", City: "St. George"},
	},
	// Lee, Mike (Utah)
	"2022245444": []FieldOffice{
		FieldOffice{Phone: "801-392-9633", City: "Ogden"},
		FieldOffice{Phone: "801-524-5933", City: "Salt Lake City"},
		FieldOffice{Phone: "435-628-5514", City: "St. George"},
	},
	// Leahy, Patrick (Vermont)
	"2022244242": []FieldOffice{
		FieldOffice{Phone: "802-863-2525", City: "Burlington"},
		FieldOffice{Phone: "802-229-0569", City: "Montpelier"},
	},
	// Sanders, Bernie (Vermont)
	"2022245141": []FieldOffice{
		FieldOffice{Phone: "802-862-0697", City: "Burlington"},
		FieldOffice{Phone: "802-748-9269", City: "St. Johnsbury"},
	},
	// Kaine, Tim (Virginia)
	"2022244024": []FieldOffice{
		FieldOffice{Phone: "276-525-4790", City: "Abingdon"},
		FieldOffice{Phone: "703-361-3192", City: "Manassas"},
		FieldOffice{Phone: "804-771-2221", City: "Richmond"},
		FieldOffice{Phone: "540-682-5693", City: "Roanoke"},
		FieldOffice{Phone: "757-518-1674", City: "Virginia Beach"},
	},
	// Warner, Mark (Virginia)
	"2022242023": []FieldOffice{
		FieldOffice{Phone: "276-628-8158", City: "Abingdon"},
		FieldOffice{Phone: "757-441-3079", City: "Norfolk"},
		FieldOffice{Phone: "804-775-2314", City: "Richmond"},
		FieldOffice{Phone: "540-857-2676", City: "Roanoke"},
		FieldOffice{Phone: "703-442-0670", City: "Vienna"},
	},
	// Cantwell, Maria (Washington)
	"2022243441": []FieldOffice{
		FieldOffice{Phone: "425-303-0114", City: "Everett"},
		FieldOffice{Phone: "509-946-8106", City: "Richland"},
		FieldOffice{Phone: "206-220-6400", City: "Seattle"},
		FieldOffice{Phone: "509-353-2507", City: "Spokane"},
		FieldOffice{Phone: "253-572-2281", City: "Tacoma"},
		FieldOffice{Phone: "360-696-7838", City: "Vancouver"},
	},
	// Murray, Patty (Washington)
	"2022242621": []FieldOffice{
		FieldOffice{Phone: "425-259-6515", City: "Everett"},
		FieldOffice{Phone: "206-553-5545", City: "Seattle"},
		FieldOffice{Phone: "509-624-9515", City: "Spokane"},
		FieldOffice{Phone: "253-572-3636", City: "Tacoma"},
		FieldOffice{Phone: "360-696-7797", City: "Vancouver"},
		FieldOffice{Phone: "509-453-7462", City: "Yakima"},
	},
	// Capito, Shelley Moore (West Virginia)
	"2022246472": []FieldOffice{
		FieldOffice{Phone: "304-347-5372", City: "Beckley"},
		FieldOffice{Phone: "304-347-5372", City: "Charleston"},
		FieldOffice{Phone: "304-262-9285", City: "Martinsburg"},
		FieldOffice{Phone: "304-292-2310", City: "Morgantown"},
	},
	// Manchin, Joe (West Virginia)
	"2022243954": []FieldOffice{
		FieldOffice{Phone: "304-342-5855", City: "Charleston"},
		FieldOffice{Phone: "304-264-4626", City: "Eastern Panhandle"},
		FieldOffice{Phone: "304-368-0567", City: "Fairmont"},
	},
	// Baldwin, Tammy (Wisconsin)
	"2022245653": []FieldOffice{
		FieldOffice{Phone: "715-832-8424", City: "Eau Claire"},
		FieldOffice{Phone: "920-498-2668", City: "Green Bay"},
		FieldOffice{Phone: "608-796-0045", City: "La Crosse"},
		FieldOffice{Phone: "608-264-5338", City: "Madison"},
		FieldOffice{Phone: "414-297-4451", City: "Milwaukee"},
		FieldOffice{Phone: "715-261-2611", City: "Wausau"},
	},
	// Johnson, Ron (Wisconsin)
	"2022245323": []FieldOffice{
		FieldOffice{Phone: "414-276-7282", City: "Milwaukee"},
		FieldOffice{Phone: "920-230-7250", City: "Oshkosh"},
	},
	// Barrasso, John (Wyoming)
	"2022246441": []FieldOffice{
		FieldOffice{Phone: "307-261-6413", City: "Casper"},
		FieldOffice{Phone: "307-772-2451", City: "Cheyenne"},
		FieldOffice{Phone: "307-856-6642", City: "Riverton"},
		FieldOffice{Phone: "307-362-5012", City: "Rock Springs"},
		FieldOffice{Phone: "307-672-6456", City: "Sheridan"},
	},
	// Enzi, Michael (Wyoming)
	"2022243424": []FieldOffice{
		FieldOffice{Phone: "307-261-6572", City: "Casper"},
		FieldOffice{Phone: "307-772-2477", City: "Cheyenne"},
		FieldOffice{Phone: "307-527-9444", City: "Cody"},
		FieldOffice{Phone: "307-682-6268", City: "Gillette"},
		FieldOffice{Phone: "307-739-9507", City: "Jackson"},
	},
}
