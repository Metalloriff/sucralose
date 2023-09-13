export default class Timer {
	timeout;
	startTime = performance.now();
	remainingTime;
	callback;
	duration;

	constructor(callback, duration, playAutomatically = true) {
		this.callback = callback;
		this.duration = duration;
		this.remainingTime = duration;

		if (playAutomatically)
			this.resume();
	}

	resume() {
		this.startTime = performance.now();

		clearTimeout(this.timeout);
		this.timeout = setTimeout(this.callback, this.remainingTime);
	}

	pause() {
		clearTimeout(this.timeout);
		this.remainingTime -= performance.now() - this.startTime;
	}

	end() {
		clearTimeout(this.timeout);
		this.callback();
	}

	destroy() {
		this.callback = null;
		clearTimeout(this.timeout);
		this.remainingTime = 0;
	}
}