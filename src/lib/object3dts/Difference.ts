/**
 * Copyright (c) 2018 Bitbloq (BQ)
 *
 * License: MIT
 *
 * long description for the file
 *
 * @summary short description for the file
 * @author David García <https://github.com/empoalp>, Alberto Valero <https://github.com/avalero>
 *
 * Created at     : 2018-10-16 13:00:00
 * Last modified  : 2018-11-16 19:35:34
 */

import CompoundObject, {
  ICompoundObjectJSON,
  ChildrenArray,
} from './CompoundObject';
import Object3D from './Object3D';
import { OperationsArray } from './ObjectsCommon';
import ObjectFactory from './ObjectFactory';
import Scene from './Scene';

export default class Difference extends CompoundObject {
  static typeName: string = 'Difference';

  public static newFromJSON(
    object: ICompoundObjectJSON,
    scene: Scene,
  ): Difference {
    const children: ChildrenArray = [];

    if (object.type != Difference.typeName) throw new Error('Not Union Object');

    object.children.forEach(element => {
      const json = JSON.stringify(element);
      const child = ObjectFactory.newFromJSON(object) as Object3D;
      children.push(child);
    });

    return new Difference(children, object.operations, scene);
  }

  constructor(
    children: ChildrenArray = [],
    operations: OperationsArray = [],
    scene: Scene,
  ) {
    super(children, operations, scene);
    this.type = Difference.typeName;
  }

  public clone(): Difference {
    const childrenClone: Array<Object3D> = this.children.map(child =>
      child.clone(),
    );
    const obj = new Difference(childrenClone, this.operations);
    if (!this.meshUpdateRequired && !this.pendingOperation) {
      obj.setMesh(this.mesh.clone());
    }
    return obj;
  }
}
