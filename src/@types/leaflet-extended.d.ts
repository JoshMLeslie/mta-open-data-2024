declare namespace L {
	namespace Control {
		interface TextBoxOptions extends ControlOptions {
			id?: string;
			className?: string;
		}
		class TextBox extends Control {
			constructor(options?: TextBoxOptions);
			options: TextBoxOptions;
			updateText: (text: string) => void;
		}
	}
}
