/*
 Five bar kinematics library

 convert between motor angle and end effector x/y postion for a
 5 bar pantograph linkage.

*/

// hide everything from the rest of javascript, except the pieces we want to share with you
(function(window)
{
	"use strict";

	function define_library()
	{
		// our library
		var fiveBar = {};

		// see http://hades.mech.northwestern.edu/index.php/Design_and_Control_of_a_Pantograph_Robot
		// takes angle of actuators in deg (motors)
		// returns x,y of effector (end)
		fiveBar.forwardKinematics = function(theta_1, theta_5)
		{
			// force to float
			theta_1 = parseFloat(theta_1);
			theta_5 = parseFloat(theta_5);

			// make sure we stay within our limits
			//theta_1 = clamp(theta_1, p1Lim);
			//theta_5 = clamp(theta_5, p5Lim);

			// deg to radian
			theta_1 = theta_1 * Math.PI / 180;
			theta_5 = theta_5 * Math.PI / 180;

			// remember p1 is at x,y 0,0

			// px is pivot 1-5
			// ax is arm length 1-5
			// theta_x is pivot angle 1-5


			// xy of point p2 (end of first actuator)
			var p2_x = Math.cos(theta_1) * a1;
			var p2_y = Math.sin(theta_1) * a1;

			// xy of point p4 (end of second actuator)
			var p4_x = Math.cos(theta_5) * a4 - a5; // x,y is centered on p1
			var p4_y = Math.sin(theta_5) * a4;

			// length of virtual arm between p2 and p4
			var a24 = Math.sqrt(Math.pow(p2_x-p4_x, 2) + Math.pow(p2_y-p4_y, 2));

			// length? of virtual arm between p2 and virtual pivot h
			// h is the base of the right triangles formed by a24 and p3
			var a2h = (Math.pow(a2, 2) + Math.pow(a24, 2) - Math.pow(a3, 2)) / (2 * a24);

			// xy of virtual point ph
			var ph_x = p2_x + (a2h/a24) * (p4_x - p2_x);
			var ph_y = p2_y + (a2h/a24) * (p4_y - p2_y);

			// length of virtual arm between ph and p3
			var a3h = Math.sqrt(Math.pow(a2, 2) - Math.pow(a2h, 2));

			// xy of point p3
			var p3_x = ph_x + (a3h/a24) * (p4_y - p2_y);
			var p3_y = ph_y - (a3h/a24) * (p4_x - p2_x);

			return [p3_x, p3_y];
		}

		// takes effector x,y position and returns motor angles needed to get there
		fiveBar.reverseKinematics = function(p3_x, p3_y)
		{
			// force to float
			p3_x = parseFloat(p3_x);
			p3_y = parseFloat(p3_y);

			// remember p1 is at x,y 0,0

			// length of virtual bar between p1 and p3
			var a13 = Math.sqrt(Math.pow(p3_x, 2) + Math.pow(p3_y, 2));

			// length of virtual bar between p5 and p3
			var a53 = Math.sqrt(Math.pow(p3_x+a5, 2) + Math.pow(p3_y, 2));

			var alpha_1 = Math.acos((Math.pow(a1, 2) + Math.pow(a13, 2) - Math.pow(a2, 2)) / (2 * a1 * a13));
			var beta_1 = Math.atan2(p3_y, -p3_x);
			var theta_1 = Math.PI - alpha_1 - beta_1;

			var alpha_5 = Math.atan2(p3_y, p3_x+a5);
			var beta_5 = Math.acos((Math.pow(a53, 2) + Math.pow(a4, 2) - Math.pow(a3, 2)) / (2 * a53 * a4));
			var theta_5 = alpha_5 + beta_5;

			// radian to deg
			theta_1 = theta_1 * 180 / Math.PI;
			theta_5 = theta_5 * 180 / Math.PI;

			// make sure we stay within our limits
			var t1 = theta_1; //clamp(theta_1, p1Lim);
			var t5 = theta_5; //clamp(theta_5, p5Lim);

			return [t1, t5];
		}

		// **** Hidden Functions ****

		function clamp(v, r) 
		{
			return (v < r[0]) ? r[0] : (v > r[1]) ? r[1] : v;
		}

		function magnitude(v)
		{
			return Math.sqrt(Math.power(v[0], 2), Math.power(v[1], 2));
		}

		/*
		function traceLimits()
		{
			var p1 = clamp(90, p1Lim);
			var p5 = clamp(90, p5Lim);

			while(p1 > p1Lim[0])
			{
				p1 = clamp(p1-step, p1Lim);
				p5 = clamp(p5-step, p5Lim);
			}

			while(p5 < p5Lim[1])
			{
				p5 = clamp(p5+step, p5Lim);
			}

			while(p1 < p1Lim[1])
			{
				p1 = clamp(p1+step, p1Lim);
			}

			while(p5 > p5Lim[0])
			{
				p1 = clamp(p1-step, p1Lim);
				p5 = clamp(p5-step, p5Lim);
			}
		}
		*/


		// **** Hidden Variables ****
		var calib = 
		{
			motors : 
			[
				{	// right motor 
					min : -40,
					max : 100,
					// translation angle between servo coordinates and world coordinates
					offset : 20 
				},
				{	// left motor 
					min : 80,
					max : 220,
					// translation angle between servo coordinates and world coordinates
					offset : 20
				},
			],
			// length in inches
			arm_len :
			{
				a1 : 4,		// right motor arm
				a2 : 4.6,	// right extension arm
				a3 : 4.6,	// left extension arm
				a4 : 4,		// left motor arm
				a5 : 0.6	// gap between motors
			}
		};

		
		// length of arms (in inches)
		var a1 = 4;
		var a2 = 4.6;
		var a3 = 4.6;
		var a4 = 4;
		var a5 = 0.6;

		// define limits on how far motors can turn
		// remember that 0 degrees is going straight right
		var p1Lim = [-40,100];
		var p5Lim = [180 - p1Lim[1], 180 - p1Lim[0]];

		// limit how far appart the arms can get
		var maxAngleDif = 180;

		// limit x/y motion to fit within a circle
		var maxDist; // set to magnitude(forwardKinematics(clamp(90, p1Lim), clamp(90, p5Lim)))

		// return the one instance of our library
		return fiveBar;
	}

	// try and detect if we have been instanced already, and abort if so
	if(typeof(fiveBar) === 'undefined')
	{
		window.fiveBar = define_library();
	}
	else
	{
		console.log("fiveBar already defined!");
	}
})(window);

