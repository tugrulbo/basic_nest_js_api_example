import { HttpException, HttpStatus, Injectable, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './product.entity';
import { UserType } from '../user/user.entity';

@Injectable()
export class ProductService {

    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>;

    public async all() {
        return this.repository.find({ relations: ['owner'] });
    }

    public async findOne(productId: string) {
        let product = await this.repository.findOne({ where: { id: productId }, relations: ['owner'] });

        if (!product)
            throw new HttpException('Product not found', HttpStatus.NOT_FOUND);

        return product;

    }

    public add(request: any) {
        const { category_id, name, image, description } = request['body']

        const product = new ProductEntity();

        product.category_id = category_id;
        product.name = name;
        product.image = image;
        product.description = description;
        product.owner = request.user.id

        return this.repository.save(product);
    }

    public async update(productId: string, request: any) {
        const { category_id, name, image, description } = request['body']
        let product = await this.repository.findOne({ where: { id: productId }, relations: ['owner'] });

        if (!product)
            throw new HttpException('Product not found', HttpStatus.NOT_FOUND);



        if (request.user.user_type == UserType.USER) {
            if (product.owner['id'] == request.user.id) {
                product.category_id = category_id;
                product.name = name;
                product.image = image;
                product.description = description;
                return this.repository.save(product);
            } else {
                throw new HttpException('You cant update', HttpStatus.NOT_ACCEPTABLE);
            }

        }

        if (request.user.user_type == UserType.USER) {
            product.category_id = category_id;
            product.name = name;
            product.image = image;
            product.description = description;
            return this.repository.save(product);
        }


    }

    public async delete(id: string) {
        const product = await this.repository.findOne({ where: { id } });
        if (!product)
            throw new HttpException('Product not found', HttpStatus.NOT_FOUND);

        return this.repository.delete({ id: id });
    }
}
