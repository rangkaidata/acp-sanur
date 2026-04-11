	/* Car class, optimized as a flyweight */
	
	var Car = function(make, model,year) {
		this.make = make;
		this.mode = model;
		this.year = year;
	};
	
	Car.prototype = {
		getMake: function() {
			return this.make;
		}
		getModel: function() {
			return this.model;
		}
		getYear: function() {
		return this.year;
		}
	}
	
// Instantion Using a Factory

	/* CarFactory singleton. */
	
	var CarFactory = (function() {
	
		var createCars = {};
		
		return {
			createCar: function(make, model, year) {
				//
				if(createCars[make + '-' + model+'-'+year]) {
					return createdCars[make + model + year];
				}
				// Otherwise create a new instance and save it.
				else {
					var car = new Car(make, model, year);
					createdCars[make + '-' + model + '-' + year] = car;
					return car;
				}
			}
		};
	})();
	
	
