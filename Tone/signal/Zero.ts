import { Gain } from "../core/context/Gain";
import { connect, disconnect, ToneAudioNodeOptions } from "../core/context/ToneAudioNode";
import { optionsFromArguments } from "../core/util/Defaults";
import { SignalOperator } from "./SignalOperator";

/**
 *  Tone.Zero outputs 0's at audio-rate. The reason this has to be
 *  it's own class is that many browsers optimize out Tone.Signal
 *  with a value of 0 and will not process nodes further down the graph.
 */
export class Zero extends SignalOperator<ToneAudioNodeOptions> {
	name = "Zero";

	/**
	 * The gain node which connects the constant source to the output
	 */
	private _gain = new Gain({ context : this.context });
	protected _internalChannels = [this._gain];

	/**
	 * Only outputs 0
	 */
	output = this._gain;

	/**
	 * no input node
	 */
	input = undefined;

	constructor() {
		super(Object.assign(optionsFromArguments(Zero.getDefaults(), arguments)));
		connect(this.context.getConstant(0), this._gain);
	}

	/**
	 * clean up
	 */
	dispose(): this {
		super.dispose();
		disconnect(this.context.getConstant(0), this._gain);
		return this;
	}
}