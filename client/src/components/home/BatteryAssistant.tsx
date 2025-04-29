import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Zap, CalendarCheck } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@shared/schema";
import { ProductGrid } from "@/components/products/ProductGrid";

export default function BatteryAssistant() {
  const { toast } = useToast();
  const [carBrand, setCarBrand] = useState<string>("");
  const [carModel, setCarModel] = useState<string>("");
  const [carYear, setCarYear] = useState<string>("");
  const [inverterBrand, setInverterBrand] = useState<string>("");
  const [inverterCapacity, setInverterCapacity] = useState<string>("");
  const [backupRequired, setBackupRequired] = useState<string>("");
  const [carResults, setCarResults] = useState<Product[]>([]);
  const [inverterResults, setInverterResults] = useState<Product[]>([]);
  const [showCarResults, setShowCarResults] = useState(false);
  const [showInverterResults, setShowInverterResults] = useState(false);
  
  const handleCarSearch = () => {
    if (!carBrand || !carModel || !carYear) {
      toast({
        title: "Incomplete Selection",
        description: "Please select all fields for car battery search",
        variant: "destructive",
      });
      return;
    }
    
    fetchCarBatteries.refetch();
  };
  
  const handleInverterSearch = () => {
    if (!inverterBrand || !inverterCapacity || !backupRequired) {
      toast({
        title: "Incomplete Selection",
        description: "Please select all fields for inverter battery search",
        variant: "destructive",
      });
      return;
    }
    
    fetchInverterBatteries.refetch();
  };
  
  const handleWhatsAppSchedule = () => {
    toast({
      title: "WhatsApp Service",
      description: "This feature will connect you to our WhatsApp service for scheduling a free battery health check.",
    });
    // In a real implementation, this would open WhatsApp with a pre-filled message
  };
  
  // Car battery compatibility search
  const fetchCarBatteries = useQuery<Product[]>({
    queryKey: ["/api/compatibility/car", carBrand, carModel, carYear],
    enabled: false,
    queryFn: async () => {
      const response = await fetch(`/api/compatibility/car?brand=${carBrand}&model=${carModel}&year=${carYear}`);
      if (!response.ok) throw new Error("Failed to fetch compatible car batteries");
      const data = await response.json();
      setCarResults(data);
      setShowCarResults(true);
      setShowInverterResults(false);
      return data;
    }
  });
  
  // Inverter battery compatibility search
  const fetchInverterBatteries = useQuery<Product[]>({
    queryKey: ["/api/compatibility/inverter", inverterBrand, inverterCapacity, backupRequired],
    enabled: false,
    queryFn: async () => {
      const response = await fetch(`/api/compatibility/inverter?brand=${inverterBrand}&capacity=${inverterCapacity}&backupHours=${backupRequired}`);
      if (!response.ok) throw new Error("Failed to fetch compatible inverter batteries");
      const data = await response.json();
      setInverterResults(data);
      setShowInverterResults(true);
      setShowCarResults(false);
      return data;
    }
  });
  
  return (
    <section id="battery-assistant" className="py-10 bg-gradient-to-b from-primary-50 to-white dark:from-gray-950 dark:to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Battery Fitment Assistant</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Not sure which battery fits your vehicle or inverter? Our assistant helps you find the perfect match.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden">
          <div className="p-6 sm:p-10">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Car Battery Selector */}
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <Car className="h-6 w-6 text-primary-700 mr-3" />
                  <h3 className="text-xl font-semibold">Find Car Battery</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">Car Brand</label>
                    <Select
                      value={carBrand}
                      onValueChange={setCarBrand}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Maruti Suzuki">Maruti Suzuki</SelectItem>
                        <SelectItem value="Hyundai">Hyundai</SelectItem>
                        <SelectItem value="Tata">Tata</SelectItem>
                        <SelectItem value="Mahindra">Mahindra</SelectItem>
                        <SelectItem value="Honda">Honda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Car Model</label>
                    <Select
                      value={carModel}
                      onValueChange={setCarModel}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Swift">Swift</SelectItem>
                        <SelectItem value="Baleno">Baleno</SelectItem>
                        <SelectItem value="i20">i20</SelectItem>
                        <SelectItem value="Nexon">Nexon</SelectItem>
                        <SelectItem value="City">City</SelectItem>
                        <SelectItem value="Creta">Creta</SelectItem>
                        <SelectItem value="Alto">Alto</SelectItem>
                        <SelectItem value="Wagon R">Wagon R</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                    <Select
                      value={carYear}
                      onValueChange={setCarYear}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                        <SelectItem value="2021">2021</SelectItem>
                        <SelectItem value="2020">2020</SelectItem>
                        <SelectItem value="2019">2019</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    onClick={handleCarSearch}
                    className="w-full bg-primary-700 hover:bg-primary-800"
                    disabled={fetchCarBatteries.isFetching}
                  >
                    {fetchCarBatteries.isFetching ? "Searching..." : "Find Compatible Batteries"}
                  </Button>
                </div>
              </div>
              
              {/* Inverter Battery Selector */}
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <Zap className="h-6 w-6 text-primary-700 mr-3" />
                  <h3 className="text-xl font-semibold">Find Inverter Battery</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inverter Brand</label>
                    <Select
                      value={inverterBrand}
                      onValueChange={setInverterBrand}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Luminous">Luminous</SelectItem>
                        <SelectItem value="Exide">Exide</SelectItem>
                        <SelectItem value="Su-Kam">Su-Kam</SelectItem>
                        <SelectItem value="Microtek">Microtek</SelectItem>
                        <SelectItem value="V-Guard">V-Guard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inverter Capacity</label>
                    <Select
                      value={inverterCapacity}
                      onValueChange={setInverterCapacity}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Capacity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="600 VA">600 VA</SelectItem>
                        <SelectItem value="800 VA">800 VA</SelectItem>
                        <SelectItem value="1100 VA">1100 VA</SelectItem>
                        <SelectItem value="1500 VA">1500 VA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Backup Required</label>
                    <Select
                      value={backupRequired}
                      onValueChange={setBackupRequired}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Hours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2-4 Hours">2-4 Hours</SelectItem>
                        <SelectItem value="4-6 Hours">4-6 Hours</SelectItem>
                        <SelectItem value="6-8 Hours">6-8 Hours</SelectItem>
                        <SelectItem value="8+ Hours">8+ Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    onClick={handleInverterSearch}
                    className="w-full bg-primary-700 hover:bg-primary-800"
                    disabled={fetchInverterBatteries.isFetching}
                  >
                    {fetchInverterBatteries.isFetching ? "Searching..." : "Find Compatible Batteries"}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Results display */}
            {(showCarResults || showInverterResults) && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-semibold mb-4">
                  {showCarResults ? "Compatible Car Batteries" : "Compatible Inverter Batteries"}
                </h3>
                
                {showCarResults && carResults.length === 0 && (
                  <p className="text-gray-600 dark:text-gray-400">No compatible batteries found for your selection. Please try different criteria or contact us for assistance.</p>
                )}
                
                {showInverterResults && inverterResults.length === 0 && (
                  <p className="text-gray-600 dark:text-gray-400">No compatible batteries found for your selection. Please try different criteria or contact us for assistance.</p>
                )}
                
                {showCarResults && carResults.length > 0 && (
                  <ProductGrid products={carResults} />
                )}
                
                {showInverterResults && inverterResults.length > 0 && (
                  <ProductGrid products={inverterResults} />
                )}
              </div>
            )}
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CalendarCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Schedule a Free Battery Health Check</h3>
                    <p className="text-gray-600">Our experts will check your battery's health and provide recommendations</p>
                  </div>
                </div>
                <Button 
                  onClick={handleWhatsAppSchedule}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                  </svg>
                  Schedule via WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
