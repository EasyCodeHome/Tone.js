import { EffectOptions } from "./Effect";
import { ToneAudioNode } from "../core/context/ToneAudioNode";
import { CrossFade } from "../component/channel/CrossFade";
import { Signal } from "../signal/Signal";
import { Split } from "../component/channel/Split";
import { Gain } from "../core/context/Gain";
import { Merge } from "../component";
import { readOnly } from "../core/util/Interface";

export type StereoEffectOptions = EffectOptions;

/**
 * Base class for Stereo effects.
 */
export class StereoEffect<Options extends StereoEffectOptions> extends ToneAudioNode<Options> {

	readonly name: string = "StereoEffect";

	readonly input: Gain;
	readonly output: CrossFade;

	/**
	 * the drywet knob to control the amount of effect
	 */
	private _dryWet: CrossFade;
	
	/**
	 * The wet control, i.e. how much of the effected
	 * will pass through to the output.
	 */
	readonly wet: Signal<"normalRange">;
	
	/**
	 * Split it
	 */
	private _split: Split;
	
	/**
	 * the stereo effect merger
	 */
	private _merge: Merge;

	constructor(options: StereoEffectOptions) {

		super(options);

		this.input = new Gain({ context: this.context });
		// force mono sources to be stereo
		this.input.channelCount = 2;
		this.input.channelCountMode = "explicit";

		this._dryWet = this.output = new CrossFade({
			context: this.context,
			fade: options.wet
		});
		this.wet = this._dryWet.fade;
		this._split = new Split({ context: this.context, channels: 2 });
		this._merge = new Merge({ context: this.context, channels: 2 });

		// connections
		this.input.connect(this._split);
		// dry wet connections
		this.input.connect(this._dryWet.a);
		this._merge.connect(this._dryWet.b);
		readOnly(this, ["wet"]);
	}
	
	/**
	 * Connect the left part of the effect
	 */
	protected connectEffectLeft(node: ToneAudioNode): void{
		this._split.connect(node, 0, 0);
		node.connect(this._merge, 0, 0);
	}
	
	/**
	 * Connect the right part of the effect
	 */
	protected connectEffectRight(node: ToneAudioNode): void{
		this._split.connect(node, 1, 0);
		node.connect(this._merge, 0, 1);
	}

	static getDefaults(): StereoEffectOptions {
		return Object.assign(ToneAudioNode.getDefaults(), {
			wet: 1,
		});
	}

	dispose(): this {
		super.dispose();
		this._dryWet.dispose();
		this._split.dispose();
		this._merge.dispose();
		return this;
	}
}
