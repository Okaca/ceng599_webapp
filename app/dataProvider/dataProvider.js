import axios from "axios";

class Dataprovider {
  async getMigros(date) {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api" + "/migros",
        {
          params: {
            date: date,
          },
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from migros:`, error);
      return []; // Return an empty array in case of an error
    }
  }

  async getSokMarket(date) {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api" + "/sok", {
        params: {
          date: date,
        },
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from ŞOK:`, error);
      return []; // Return an empty array in case of an error
    }
  }

  async getCarefour(date) {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api" + "/carefour",
        {
          params: {
            date: date,
          },
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from carefour:`, error);
      return []; // Return an empty array in case of an error
    }
  }

  async getA101(date) {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api" + "/a101", {
        params: {
          date: date,
        },
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from carefour:`, error);
      return []; // Return an empty array in case of an error
    }
  }

  async getGetir(date) {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api" + "/getir", {
        params: {
          date: date,
        },
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from carefour:`, error);
      return []; // Return an empty array in case of an error
    }
  }

  async getMigrosItemById(id) {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api" + "/migros/product",
        {
          params: {
            id: id,
          },
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from carefour:`, error);
      return []; // Return an empty array in case of an error
    }
  }

  async getMigrosItemByName(name) {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api" + "/migros/filter",
        {
          keyword: name, // Sending the name as the keyword in the request body
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from carefour:`, error);
      return []; // Return an empty array in case of an error
    }
  }

  async getMigrosChartValuesByName(name) {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api" + "/migros/chartData",
        {
          keyword: name, // Sending the name as the keyword in the request body
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from carefour:`, error);
      return []; // Return an empty array in case of an error
    }
  }

  async getSokItemById(id) {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api" + "/sok/product",
        {
          params: {
            id: id,
          },
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from carefour:`, error);
      return []; // Return an empty array in case of an error
    }
  }

  async getSokChartValuesByName(name) {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api" + "/sok/chartData",
        {
          keyword: name, // Sending the name as the keyword in the request body
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from carefour:`, error);
      return []; // Return an empty array in case of an error
    }
  }

  async getGetirItemById(id) {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api" + "/getir/product",
        {
          params: {
            id: id,
          },
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from carefour:`, error);
      return []; // Return an empty array in case of an error
    }
  }

  async getGetirChartValuesByName(name) {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api" + "/getir/chartData",
        {
          keyword: name, // Sending the name as the keyword in the request body
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from carefour:`, error);
      return []; // Return an empty array in case of an error
    }
  }

  async getCarefourItemById(id) {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api" + "/carefour/product",
        {
          params: {
            id: id,
          },
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from carefour:`, error);
      return []; // Return an empty array in case of an error
    }
  }

  async getCarefourChartValuesByName(name) {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api" + "/carefour/chartData",
        {
          keyword: name, // Sending the name as the keyword in the request body
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from carefour:`, error);
      return []; // Return an empty array in case of an error
    }
  }

  async getA101ItemById(id) {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api" + "/a101/product",
        {
          params: {
            id: id,
          },
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from carefour:`, error);
      return []; // Return an empty array in case of an error
    }
  }

  async getA101ChartValuesByName(name) {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api" + "/a101/chartData",
        {
          keyword: name, // Sending the name as the keyword in the request body
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from carefour:`, error);
      return []; // Return an empty array in case of an error
    }
  }

  async getMarketItemByKeyword(keywordJson) {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api" + "/filter",
        {
          main: keywordJson.main,
          sub: keywordJson.sub, // Sending the keywordJson as the main and sub in the request body
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from carefour:`, error);
      return []; // Return an empty array in case of an error
    }
  }
}

export default Dataprovider;
