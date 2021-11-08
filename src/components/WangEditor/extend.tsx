/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable no-console */
/*
 * @Author: donggg
 * @LastEditors: donggg
 * @Date: 2021-07-04 18:55:30
 * @LastEditTime: 2021-07-04 18:59:17
 */
import ReactWEdtiorCore from './core';
import { ReactWEProps } from './type';

export default function extend(context: Record<string, unknown>): any {
	return class Component extends ReactWEdtiorCore {
		// eslint-disable-next-line @typescript-eslint/no-useless-constructor
		constructor(props: ReactWEProps) {
			super(props);
		}

		componentDidMount() {
			try {
				this.init();
				this.create(context);
			} catch (e) {
				console.error(`[ReactWEdtior Error]: ${e}`);
			}
		}
	};
}
