/*
 Sound servo library

 Allows you to control two RC servo motors via the audio headphone jack on
 your tablet or phone.

 You need to wire your servos to a power source (2-4 AA batterys work fine)
 You also need to hook the control line of the servos to the left and right outputs
 from the headphone jack.  Don't forget to hook the grounds together as well.
*/

// hide everything from the rest of javascript, except the pieces we want to share with you
(function(window)
{
	"use strict";

	function define_library()
	{
		// our library
		var soundServo = {};

		soundServo.setPosition = function(degrees, chan) 
		{
			var nMin = -2;
			var nMax = 2;
			var nStep = 0.5;//0.2;
			var nVal = nMin;

			// range check
			if(degrees < degMin[chan])
				degrees = degMin[chan];
			if(degrees > degMax[chan])
				degrees = degMax[chan];

			var samplesPerMs = context.sampleRate * 0.001;
			// a 1.5 ms pulse represents neutral or 0 deg
			var pwm = 1.5 * samplesPerMs + degrees * msPerDeg * samplesPerMs;

			for (var i = 0; i < data[chan].length; i++) 
			{
				data[chan][i] = nVal;
				if(i < pwm)
				{
					if(nVal < nMax)
						nVal += nStep;
					if(nVal > nMax)
						nVal = nMax;
				}
				else if(i >= pwm)
				{
					if(nVal > nMin)
						nVal -= nStep;
					if(nVal < nMin)
						nVal = nMin;
				}
			}
		};

		soundServo.setVolume = function(vol) 
		{
			gainNode.gain.value = vol;

			// attempt to start our sound if not already playing
			//if(source.context.state != 'running')
			//if(context.state != 'running')
			//****FixMe, need to call source.start(0) once in onTouchEnd() handler
			// so iOS is happy
				source.start(0);
		};

		soundServo.setCalibration = function(min, max, chan)
		{
			degMin[chan] = min;
			degMax[chan] = max
		}

		// **** Hidden Functions ****

		function initAudio()
		{
			window.AudioContext = (window.AudioContext || window.webkitAudioContext);
			context = new window.AudioContext();

			data = [];

			var samplesPerMs = context.sampleRate * 0.001;
			var bufferLength = samplesPerMs * 20;
			buffer = context.createBuffer(2, bufferLength, context.sampleRate);

			data[0] = buffer.getChannelData(0);
			data[1] = buffer.getChannelData(1);

			source = context.createBufferSource();
			source.loop = true; // Make sure that sound will repeat over and over again
			source.buffer = buffer; // Assign our buffer to the source node buffer

			gainNode = context.createGain();

			//connect the source to the gainNode, and the gainNode to the destination.
			source.connect(gainNode);
			gainNode.connect(context.destination);

			soundServo.setPosition(0, 0); //start in the center.
			soundServo.setPosition(0, 1); //start in the center.

			soundServo.setVolume(0.0); //set initial volumn to 0 pct
		}

		// **** Hidden Variables ****

		var context;
		var data = [];
		var buffer;
		var source;
		var gainNode;

		// range of motion
		var degMin = [-90,-90];
		var degMax = [90,90];
		var msPerDeg = 2.0 / 180.0;

		// initialize
		initAudio();

		// return the one instance of our library
		return soundServo;
	}

	// try and detect if we have been instanced already, and abort if so
	if(typeof(soundServo) === 'undefined')
	{
		window.soundServo = define_library();
	}
	else
	{
		console.log("soundServo already defined!");
	}
})(window);
